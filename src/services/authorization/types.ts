export declare namespace AuthTypes {

    export interface ProlongParams {
        refresh_token: string
        timezoneoffset: number
        fcm_token: string
    }

    export interface InitParams {
        token: string,
        timezoneoffset: number
        fcm_token: string
        username: string
    }

    export interface AuthParams {
        username: string
        password: string
        device: string
        timezoneoffset: number
        fcm_token: string
    }

}
