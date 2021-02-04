export default interface Api{
    withToken(token:string): Api
    post(url: string, params: any): Promise<any>
    get(url: string, params: any): Promise<any>
    delete(url: string, params: any): Promise<any>
}