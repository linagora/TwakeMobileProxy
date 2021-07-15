import {FastifyRequest} from "fastify";
import UsersService from "../users/service";
import CompaniesService from "./service";
import {CompanyTypes} from "./types";

export class CompaniesController {

    constructor(protected usersService: UsersService, protected companiesService: CompaniesService) {
    }


    async list(): Promise<CompanyTypes.Company[]> {
        const data = await this.usersService.getCurrent()

        const companiesHash = {} as any
        data.workspaces?.forEach((ws: any) => {
            if (!companiesHash[ws.group.id]) {
                companiesHash[ws.group.id] = {
                    id: ws.group.id,
                    name: ws.group.name.trim(),
                    // unique_name: ws.group.unique_name,
                    logo: ws.group.logo,
                    total_members: +ws.group.total_members,
                    notification_rooms: [
                        `previous:group/${ws.group.id}`
                    ]
                } as CompanyTypes.Company

                companiesHash[ws.group.id].permissions = ws._user_is_organization_administrator
                    ? ['CREATE_WORKSPACES'] : []
            }
        })
        return Object.values(companiesHash).sort((a: any, b: any) => a.name.localeCompare(b.name)) as CompanyTypes.Company[]

    }

    async badges(request: FastifyRequest<{ Querystring: CompanyTypes.GetBadges }>): Promise<CompanyTypes.Badge[]> {
        const {company_id, all_companies} = request.query

        const resources = await this.companiesService.badges(company_id, all_companies)

        const ret: {companies: {[key: string]: any}, workspaces: {[key: string]: any}, channels: {[key: string]: any}} = {
            companies: {},
            workspaces: {},
            channels: {},
        }

        for (let {company_id, workspace_id, channel_id} of resources) {
            ret.companies[company_id] = (ret.companies[company_id] || 0) + 1
            ret.workspaces[workspace_id] = (ret.workspaces[workspace_id] || 0) + 1
            ret.channels[channel_id] = (ret.channels[channel_id] || 0) + 1
        }
        const companies = ret.companies
        const workspaces = ret.workspaces
        const channels = ret.channels

        const badges: CompanyTypes.Badge[] = []

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

    async applications({query}: FastifyRequest<{ Querystring: CompanyTypes.Applications }>) {
        return this.companiesService.applications(query.company_id)

    }


}
