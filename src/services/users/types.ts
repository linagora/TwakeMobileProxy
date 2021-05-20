export interface UsersSearchRequest {
    company_id: string
    query: string
}

export interface UsersGetRequest {
    id?: string
    timezoneoffset?: number
}

export interface User {
    id: string
    email: string
    username: string
    firstname: string
    lastname: string
    thumbnail: string
    console_id?: string
    status_icon?: string
    status?: string
    language: string
    is_admin: boolean
    last_activity: number
    workspaces?: {[key: string]: any}[]
}

export interface UpdateProfileRequest {
    language: string
    firstname: string
    lastname: string
    old_password: string
    new_password: string
}

export interface UploadProfileResponse {
    file: string
}
