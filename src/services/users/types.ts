export declare namespace UsersTypes {
    export interface UsersSearchRequest {
        "company_id": string
        "name": string
    }

    export interface CurrentUserRequest{
        "timezoneoffset": number
    }

    export interface UsersGetRequest{
        "id": number[]
    }

    export interface User {
        id: string
        username: string
        firstname: string
        lastname: string
        thumbnail: string
        companies?: any[]
        timeZoneOffset?: number
        status?: { "icon": string, "title": string },
        notification_rooms?: string[]
    }

    export interface UpdateProfileRequest {
        language : string,
        firstname: string,
        lastname: string,
        password: { "old": string, "new": string}
    }
}