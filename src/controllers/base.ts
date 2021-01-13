import Api from '../common/twakeapi'
import UserProfile from "../models/user_profile";
import {FastifyRequest} from "fastify";
import {BadRequest} from "../common/errors";


/**
 * The Base controller
 */
export default class {
    private _api?: Api
    public request: FastifyRequest;
    private version: number[];

    /**
     * @param request
     */
    // constructor(userProfile: UserProfile) {
    //     this.userProfile = userProfile
    // }
    constructor(request: FastifyRequest) {
        this.request = request

        if (!request.headers['accept-version']) {
            throw new BadRequest("accept-version header missing")
        }

        this.version = (this.request.headers['accept-version'] as string).split('.').map(a => +a)
    }

    userProfile(){
        return {

        } as UserProfile
    }

    versionFrom(version: String) {
        const exp = this.version
        const cur = version.split('.').map(a => +a)
        if (exp[0] > cur[0]) return true
        if (exp[0] == cur[0]) {
            if (exp[1] > cur[1]) return true
            if (exp[1] == cur[1]) {
                if (exp[2] >= cur[2]) return true
            }
        }
        return false
    }

    /**
     * getter for api property
     * @return {Api}
     */
    get api(): Api {
        if (!this._api) {
            this._api = new Api(this.request.jwtToken)
        }
        return this._api
    }


}
