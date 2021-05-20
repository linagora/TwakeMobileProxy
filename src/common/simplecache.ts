import {User} from "../services/users/types"

const usersCache = {} as { [user_id: string]: User; }
const authCache = {} as { [token: string]: User; }
// const refreshTokenCache = {} as { [refresh_token: string]: any; }

export {usersCache, authCache}
