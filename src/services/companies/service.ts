import Api from "../../common/twakeapi";

export default class CompaniesService {
    constructor(protected api: Api) {
    }

    async badges(company_id: string, all_companies: boolean): Promise<Array<{ [key: string]: string }>> {
        let response = (await this.api.get(
            '/internal/services/notifications/v1/badges',
            {company_id, all_companies}
        )).resources || {}

        const companies = response.companies
        const workspaces = response.workspaces
        const channels = response.channels

        const badges: { [key: string]: any }[] = []

        for (const [k, v] of Object.entries(companies)) {
            badges.push({
                type: 'company',
                id: k,
                count: v,
            })
        }
        for (const [k, v] of Object.entries(workspaces)) {
            badges.push({
                type: 'workspace',
                id: k,
                count: v,
            })
        }
        for (const [k, v] of Object.entries(channels)) {
            badges.push({
                type: 'channel',
                id: k,
                count: v,
            })
        }

        return badges

    }

    async applications(company_id: string) {
        return this.api.post('/ajax/workspace/group/apps/get', {
            "group_id": company_id
        }).then(a => a.data.map((a: any) => a.app))
    }
}
