export declare namespace CompanyTypes {
    export interface Company {
        id: string
        name: string
        logo: string
        total_members: number
    }

    export interface GetBadges {
        company_id: string,
        all_companies: boolean,
    }

    export interface Badge {
        type: string
        id: string
        count: number 
    }

    export interface Applications {
        company_id: string
    }

}
