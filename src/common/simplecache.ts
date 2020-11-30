import User from "../models/user";
import AuthParams from "../models/auth_params";

const usersCache = {} as { [user_id: string]: User; }
const authCache = {} as { [token: string]: User; }
const refreshTokenCache = {} as { [refresh_token: string]: AuthParams; }

export {usersCache, authCache, refreshTokenCache}
