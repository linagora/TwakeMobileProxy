export declare namespace UsersTypes {
    export interface UsersSearchRequest {
        "company_id": string
        "name": string
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
}