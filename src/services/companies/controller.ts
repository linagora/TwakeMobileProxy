import UsersService from "../users/service";
import {CompanyTypes} from "./types";

export class CompaniesController {

    constructor( protected usersService: UsersService) {
    }


    async list(): Promise<CompanyTypes.Company[]> {
        const data = await this.usersService.getCurrent()

        const companiesHash = {} as any
        data.workspaces.forEach((ws: any) => {
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

                companiesHash[ws.group.id].permissions =  ws._user_is_organization_administrator
                ? ['CREATE_WORKSPACES' ] : []
            }
        })
        return Object.values(companiesHash).sort((a: any, b: any) => a.name.localeCompare(b.name)) as CompanyTypes.Company[]

    }
}