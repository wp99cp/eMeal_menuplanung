export interface CreateUserNameData {
    createUsername: {
        success: boolean,
        errors: string
    }
}

export interface CreateUserNameVars {
    username: string
}