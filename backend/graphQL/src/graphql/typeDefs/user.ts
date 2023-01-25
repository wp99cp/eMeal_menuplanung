import gql from "graphql-tag";

const typeDefs = gql`
  type User {
    id: String
    username: String
  }

  type Query {
    searchUser(username: String): [User]
    checkUsername(username: String): UpdateUserResponse
  }

  type Mutation {
    updateUser(username: String, shareEmail: Boolean): UpdateUserResponse
  }

  type Subscription {
    userCreated: User
  }

  type UpdateUserResponse {
    success: Boolean
    error: String
  }

  type CheckUsernameMutation {
    success: Boolean
    error: String
  }
`;

export default typeDefs;
