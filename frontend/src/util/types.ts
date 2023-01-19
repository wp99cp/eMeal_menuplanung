export interface CreateUserNameData {
    createUser: {
        success: boolean,
        errors: string
    }
}

export interface CreateUserNameVars {
    username: string
}