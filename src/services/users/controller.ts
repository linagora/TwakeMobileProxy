import {usersCache} from '../../common/simplecache'
import UsersService from "./service";
import {UsersTypes} from "./types";
import {FastifyRequest} from "fastify";
import User = UsersTypes.User;


/**
 * Users methods
 */


export class UsersController {

    // constructor(protected service: WorkspaceService, protected channelsService: ChannelsService, protected usersService: UsersService) {}
    constructor(protected usersService: UsersService) {
    }



    async getCurrent({query}: FastifyRequest<{ Querystring: UsersTypes.CurrentUserRequest }>): Promise<User> {

        const data = await this.usersService.getCurrent(query.timezoneoffset)
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

        return out

    }


    /**
     * Get user by Id
     * @param {string} userId
     * @return {Promise<Object>}
     */
    async getUser(userId: string) {
        if (usersCache[userId]) {
            return Promise.resolve(usersCache[userId])
        }
        return this.usersService.getUserById(userId).then((a) => {

            if (!Array.isArray(a)) {
                const user = {
                    id: a.id,
                    username: a.username.trim(),
                    firstname: (a.firstname || "").trim(),
                    lastname: (a.lastname || "").trim(),
                    thumbnail: a.thumbnail
                }
                usersCache[a.id] = user
                return user
            } else return null
        })
    }

    async getUsers({query} : FastifyRequest<{ Querystring: UsersTypes.UsersGetRequest }>) {

        if(!Array.isArray(query.id)){
            query.id = [query.id]
        }

        return (await Promise.all(query.id.map((a:any) => this.getUser(a)))).filter(a=>a)
    }

    async searchUsers({query}: FastifyRequest<{ Querystring: UsersTypes.UsersSearchRequest }>) {

    return this.usersService.searchUsers(query.company_id, query.name).then(a => a.users.map((a: any) => {
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