import Api from "../../common/twakeapi2";
import {CompanyTypes} from "./types";

export default class CompaniesService {
    constructor(protected api: Api) {
    }

    async badges(company_id: string, all_companies: boolean): Promise<CompanyTypes.Badges> {
        let resources: Array<{[key: string]: string}> = (await this.api.get(
            '/internal/services/notifications/v1/badges', 
            {company_id: company_id, all_companies: all_companies}
        )).resources || []
        let companies: {[key: string]: number} = {}
        let workspaces: {[key: string]: number} = {}
        let channels: {[key: string]: number} = {}

        for (let v of resources) {
            companies[v['company_id']] = companies[v['company_id']] || 0
            companies[v['company_id']] += 1
            workspaces[v['workspace_id']] = companies[v['workspace_id']] || 0
            workspaces[v['workspace_id']] += 1
            channels[v['channel_id']] = companies[v['channel_id']] || 0
            channels[v['channel_id']] += 1
        }

        return {
            companies: companies, 
            workspaces: workspaces, 
            channels: channels
        }
    }
}
