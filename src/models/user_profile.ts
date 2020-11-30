export default interface UserProfile {
    jwtToken: string,
    userId: string,
    timeZoneOffset: number
}


export const UserProfileMock = {
    jwtToken: "",
    userId: "",
    timeZoneOffset: 0
} as UserProfile
