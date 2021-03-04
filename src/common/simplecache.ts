import User from "../models/user";

const usersCache = {} as { [user_id: string]: User; }
const authCache = {} as { [token: string]: User; }
// const refreshTokenCache = {} as { [refresh_token: string]: any; }

export {usersCache, authCache}
