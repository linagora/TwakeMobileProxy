import Base from '../../common/base'
import {authCache, usersCache} from '../../common/simplecache'
import assert from "assert";
import WorkspaceService from "../workspaces/service";
import ChannelsService from "../channels/service";
import UsersService from "../workspaces/service";
import {UsersTypes} from "./types";
import UsersSearchRequest = UsersTypes.UsersSearchRequest;
import User = UsersTypes.User;



/**
 * Users methods
 */
export default class extends Base {
    /**
     * Get current user /users/current/get
     * @return {Promise<{firstname: string, thumbnail: string, companies: [], user_id: string, username: string, lastname: string}>}
     * @param timeZoneOffset
     */
    async getCurrent(timeZoneOffset?: number): Promise<User> {

        const data = await this.api.getCurrentUser(timeZoneOffset)
        const user = {
            id: data.id,
            username: data.username,
            firstname: data.firstname,
            lastname: data.lastname,
            thumbnail: data.thumbnail
        } as User

        usersCache[user.id] = user

        const out = Object.assign({}, user)

        out.status = {"icon": data.status_icon[0], "title": data.status_icon[1]}
        out.notification_rooms  = ['previous:users/' + data.id]

        return this.__transform(out)

    }

    __transform(user: User) {
        if (this.versionFrom("2.0.0")) {
            return user
        } else {
            return Object.assign({}, user, {"userId": user.id})
        }
    }

    /**
     * Get user by Id
     * @param {string} userId
     * @return {Promise<Object>}
     */
    async getUser(userId: string) {
        if (usersCache[userId]) {
            return Promise.resolve(this.__transform(usersCache[userId]))
        }
        return this.api.getUserById(userId).then((a) => {

            if (!Array.isArray(a)) {
                const user = {
                    id: a.id,
                    username: a.username.trim(),
                    firstname: (a.firstname || "").trim(),
                    lastname: (a.lastname || "").trim(),
                    thumbnail: a.thumbnail
                }
                usersCache[a.id] = user
                return this.__transform(user)
            } else return null
        })
    }

    async getUsers(usersIds: string[] | string) {

        if (!Array.isArray(usersIds)) {
            usersIds = [usersIds]
        }

        return (await Promise.all(usersIds.map(a => this.getUser(a)))).filter(a=>a)
    }

    async searchUsers(req: UsersSearchRequest) {
        return this.api.searchUsers(req.company_id, req.name).then(a => a.users.map((a: any) => {
            const user = a[0]
            return {
                id: user.id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname
            }
        }))
    }




}

export class UsersController {

    // constructor(protected service: WorkspaceService, protected channelsService: ChannelsService, protected usersService: UsersService) {}
    constructor(protected usersService: UsersService) {
    }

}