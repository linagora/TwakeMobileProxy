export declare namespace CompanyTypes{
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

    export interface Badges {
        companies: {[id: string]: number},
        workspaces: {[id: string]: number},
        channels: {[id: string]: number},
    }
}
