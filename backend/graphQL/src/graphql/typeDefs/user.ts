const typeDefs = `#graphql

type User {
    id: String
    username: String
}

type Query {
    searchUser(username: String): [User]
}

type Mutation {
    createUser(username: String): CreateUserNameResponse
}

type Subscription {
    userCreated: User
}

type CreateUserNameResponse {
    success: Boolean
    error: String
}

`;

export default typeDefs;