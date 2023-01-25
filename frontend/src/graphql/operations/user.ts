import { gql } from '@apollo/client';

const UserOperations = {
  Queries: {
    checkUsername: gql`
      query checkUsername($username: String) {
        checkUsername(username: $username) {
          error
          success
        }
      }
    `,
  },
  Mutation: {
    updateUser: gql`
      mutation updateUser($username: String, $shareEmail: Boolean) {
        updateUser(username: $username, shareEmail: $shareEmail) {
          error
          success
        }
      }
    `,
    checkUsername: undefined,
  },
};

export { UserOperations };
