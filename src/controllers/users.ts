import Base from './base'
import {usersCache} from '../common/simplecache'
import User from "../models/user";
import assert from "assert";


/**
 * Users methods
 */
export default class extends Base {
    /**
     * Get current user /users/current/get
     * @return {Promise<{firstname: string, thumbnail: string, companies: [], user_id: string, username: string, lastname: string}>}
     * @param timeZoneOffset
     */
    async getCurrent(timeZoneOffset?: string): Promise<User> {

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
            const user = {
                id: a.id,
                username: a.username,
                firstname: a.firstname,
                lastname: a.lastname,
                thumbnail: a.thumbnail
            }
            usersCache[a.id] = user


            return this.__transform(user)
        })
    }

    async getUsers(usersIds: string[] | string) {

        if (!Array.isArray(usersIds)) {
            usersIds = [usersIds]
        }

        return await Promise.all(usersIds.map(a => this.getUser(a)))
    }
}
