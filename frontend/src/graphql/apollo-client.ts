import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client'

console.log("URI: ", process.env.GRAPHQL_URL);

const httpLink = new HttpLink({
    uri: process.env.GRAPHQL_URL,
    credentials: "include",
});

export const apollo_client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});