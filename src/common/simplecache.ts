import {UsersTypes} from "../services/users/types"

const usersCache = {} as { [user_id: string]: UsersTypes.User; }
const authCache = {} as { [token: string]: UsersTypes.User; }
// const refreshTokenCache = {} as { [refresh_token: string]: any; }

export {usersCache, authCache}
