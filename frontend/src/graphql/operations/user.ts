import {gql} from "@apollo/client";

export default {
    Queries: {},
    Mutation: {
        createUser: gql`
            mutation createUser($username: String) {
                createUser(username: $username) {
                    error
                    success
                }
            }
        `
    }
}