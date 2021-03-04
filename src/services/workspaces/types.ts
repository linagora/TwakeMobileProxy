export declare namespace WorkspacesTypes {
    export interface WorkspaceBaseRequest {
        company_id: string
    }

    export interface WorkspaceRequest extends  WorkspaceBaseRequest{
        workspace_id: string
    }

    export interface WorkspacePostRequest extends  WorkspaceBaseRequest {
        name: string
        members: string[]
    }

    export interface WorkspaceMembersPostRequest extends WorkspaceRequest{
        members: string[] // тут email'ы
    }

}