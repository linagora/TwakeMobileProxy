export default interface User {
    id: string
    username: string
    firstname: string
    lastname: string
    thumbnail: string
    companies?: any[]
    timeZoneOffset?: number
    status?: {"icon": string, "title": string},
}
