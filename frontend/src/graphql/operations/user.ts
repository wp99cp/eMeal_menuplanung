import { gql } from '@apollo/client';

const user = {
  Queries: {},
  Mutation: {
    createUser: gql`
      mutation createUser($username: String) {
        createUser(username: $username) {
          error
          success
        }
      }
    `,
  },
};

export default user;
