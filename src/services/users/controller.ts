import {usersCache} from '../../common/simplecache'
import UsersService from "./service";
import {UsersTypes} from "./types";
import {FastifyRequest} from "fastify";
import User = UsersTypes.User;
import assert from "assert";
import {UploadedFile, UploadResponse} from "../uploader/types";
import {PayloadTooLarge} from "../../common/errors";
import UploadProfileResponse = UsersTypes.UploadProfileResponse;


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
            thumbnail: data.thumbnail,
            console_id: data.provider_id
        } as User

        usersCache[user.id] = user

        const out = Object.assign({}, user)

        out.status = {"icon": data.status_icon[0], "title": data.status_icon[1]}
        out.notification_rooms = ['previous:users/' + data.id]

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

    async getUsers({query}: FastifyRequest<{ Querystring: UsersTypes.UsersGetRequest }>) {

        if (!Array.isArray(query.id)) {
            query.id = [query.id]
        }

        return (await Promise.all(query.id.map((a: any) => this.getUser(a)))).filter(a => a)
    }

    async searchUsers({query}: FastifyRequest<{ Querystring: UsersTypes.UsersSearchRequest }>) {

        const users = (await this.usersService.searchUsers(query.company_id, query.name)) || []

        return users.map((a: any) => {
            const user = a[0]
            return {
                id: user.id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname
            }
        })
    }


    async getProfile() {
        const user = await this.usersService.getCurrent()

        const profile = {
            username: { readonly: true, value: user.username},
            firstname: { readonly: true, value: user.firstname},
            lastname: { readonly: true, value: user.lastname},
            language: { readonly: false, value: user.language, options: [
                    {value: 'de', title: 'Deutsch'},
                    {value: 'es', title: 'Español'},
                    {value: 'en', title: 'English'},
                    {value: 'fr', title: 'Français'},
                    {value: 'ja', title: '日本語'},
                    {value: 'ru', title: 'Русский'},
                    {value: 'vi', title: 'Tiếng Việt'},

                ]},
            picture: { readonly: false, value: user.picture},
            password: {readonly:false, value: {old:'', new:''}}
        }

        return profile

    }

    async updateProfile({body}: FastifyRequest<{Body: UsersTypes.UpdateProfileRequest}>) {

        if (body.password){

            assert(body.password.old, 'password.old is missing')
            assert(body.password.new, 'password.new is missing')

            await this.usersService.changePassword(body.password.old, body.password.new)
        }

        if (body.firstname || body.lastname){

            if(!body.firstname || !body.lastname){
                const user = await this.usersService.getCurrent()
                if(!body.firstname) {
                    body.firstname = user.firstname
                }
                if(!body.lastname) {
                    body.lastname = user.lastname
                }
            }

            await this.usersService.updateFirstLastName(body.firstname, body.lastname)
        }

        if (body.language){
            await this.usersService.changeLanguage(body.language)
        }

        return this.getProfile();
    }


    async updateProfilePicture(request: any): Promise<UploadProfileResponse> {

        let file: UploadedFile
        try {
            file = (await request.saveRequestFiles())[0]
        } catch (e) {
            throw new PayloadTooLarge(e.message)
        }
        const user = await this.usersService.getCurrent()

        const upload: UploadProfileResponse = await this.usersService.uploadUserPicture(user, file)
        await request.cleanRequestFiles()

        return upload
    }

}
