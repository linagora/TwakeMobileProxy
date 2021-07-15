export declare namespace WorkspacesTypes {
    export interface WorkspaceBaseRequest {
        company_id: string
    }

    export interface WorkspaceRequest extends WorkspaceBaseRequest {
        workspace_id: string
    }

    export interface WorkspacePostRequest extends WorkspaceBaseRequest {
        name: string
        members: string[]
    }

    export interface WorkspaceMembersPostRequest extends WorkspaceRequest {
        members: string[] // тут email'ы
    }

    export interface Workspace {
        id: string
        private: boolean
        logo: string
        color: string
        company_id: string
        name: string
        total_members: 6
        is_archived: boolean
        user_last_access: number,
        user_is_admin: boolean
        permissions: string[]
    }

}