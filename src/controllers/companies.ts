import Base from '../common/base'


interface Company {
    id: string
    name: string
    logo: string
    total_members: number
}

export default class extends Base {
    async list(): Promise<Company[]> {
        const data = await this.api.getCurrentUser()

        const companiesHash = {} as any
        data.workspaces.forEach((ws: any) => {
            if (!companiesHash[ws.group.id]) {
                companiesHash[ws.group.id] = {
                    id: ws.group.id,
                    name: ws.group.name.trim(),
                    // unique_name: ws.group.unique_name,
                    logo: ws.group.logo,
                    total_members: +ws.group.total_members
                } as Company
            }
        })
        return Object.values(companiesHash).sort((a: any, b: any) => a.name.localeCompare(b.name)) as Company[]

    }


}
