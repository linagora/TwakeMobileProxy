export default interface User {
    userId: string
    username: string
    firstname: string
    lastname: string
    thumbnail: string
    companies?: any[]
    timeZoneOffset?: number
}
