# GraphQL Server

::: tip
The GraphQL API can be accessed at [http://localhost:4000/graphql](http://localhost:4000/graphql). If you are visiting
this URL in your browser, you will see a GraphQL Playground, which allows you to interact with the API.
:::

The graphql API is developed using [Apollo Server](https://www.apollographql.com/docs/apollo-server/). It is written in
TypeScript using GraphQL Code Generator to generate a type-safe API. The schema of the GraphQL API is defined in
the `common/graphQL` folder.

## Best Practices

::: warning
see https://github.com/domkm/graphql-best-practices
see https://www.prisma.io/blog/the-problems-of-schema-first-graphql-development-x1mn4cb0tyl3
:::

- GraphQL does **not** implement Business Logic. It is only used to expose the data to the frontend. Business Logic is
  implemented in the backend services.

::: warning
How to implement Business Logic in the backend services? See https://graphql.org/learn/thinking-in-graphs/#business-logic-layer.
Domain Driven Design? https://www.youtube.com/watch?v=KdAJz87ANs0
:::

- Authorization and Authentication **not** implemented in GraphQL. This should be done by a express middleware.

::: warning
Authorization: see https://graphql.org/learn/authorization/
Authentication: see https://graphql.org/graphql-js/authentication-and-express-middleware/ and https://www.apollographql.com/docs/apollo-server/security/authentication/#using-a-custom-authentication-strategy

We are using GraphQL shields to implement authorization: GraphQL Permissions Framework for Complex Authorisation Systems
:::

- CORS, Authentication, Rate Limiting, Input Verification, etc. should be implemented by a express middleware.

- Disable GraphQL Playground in production!

- Ensure naming consistency in the schema

::: warning
is there an automatic way to do this?
:::

- Be open to future Modifications:
  ::: warning

E.g. use nested types and custom scalar instead of strings

- https://github.com/domkm/graphql-best-practices#field-names-and-types
  :::

- Use Arguments instead of multiple Fields: https://github.com/domkm/graphql-best-practices#arguments

- Mutations: https://github.com/domkm/graphql-best-practices#mutations

## Authentication

::: warning
https://www.apollographql.com/blog/backend/auth/setting-up-authentication-and-authorization-apollo-federation/
:::

All requests to the GraphQL API must be authenticated. Two types of authentication are supported: Session and API Keys.

- Session authentication is used for the frontend. The frontend is using [NextAuth.js](https://next-auth.js.org/) to
  authenticate the user. The NextAuth.js session is passed to the GraphQL API.
- API Key authentication is used for other backend services (e.g. the print service). The print service is using an API
  Key to authenticate itself. The API Key is passed using the HTTP header `x-api-key`. Optionally, a user_id can be
  passed using the HTTP header `x-user-id`. The latter is used to impersonate a user.

If you are using the GraphQL Playground, you can use an API Key to authenticate yourself.

::: warning schema directives
https://www.reddit.com/r/graphql/comments/gfc5w2/best_practices_for_permissions_and_access_control/
:::

::: warning
Role based access control vs. attribute based access control
:::

## Rate Limiting

The GraphQL API uses graphql-rate-limit to limit the number of requests.

::: warning
See https://xuorig.medium.com/a-guide-to-graphql-rate-limiting-security-e62a86ef8114
:::

## Input Verification

The GraphQL API uses Yup to verify the input of the GraphQL mutations. This is implemented using graphql-shield.

## Using fragments

::: warning
When and how to use fragments?
:::
