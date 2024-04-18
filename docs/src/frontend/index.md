# Frontend Architecture

The frontend is developed using [Next.js](https://nextjs.org/) together with [React](https://reactjs.org/). It is
written in [TypeScript](https://www.typescriptlang.org/). All the frontend code is located in the `frontend` folder.

The following tables give an overview of the most important folders and files of the frontend:

| Folder             | Description                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `./public`         | For static and publicly accessible files --> see [official docs](https://nextjs.org/docs/pages/building-your-application/optimizing/static-assets) |
| `./src/app`        | Contains the pages of the frontend, we are using the new [App Router](https://nextjs.org/docs/app)                                                 |
| `./src/assets`     | Contains build time assets, e.g. svg logos, ...                                                                                                    |
| `./src/components` | Contains the UI components of the frontend, see [Component Library](#component-library)                                                            |
| `./src/graphql`    | Contains the GraphQL operations, see [GraphQL - Apollo Client](#graphql-apollo-client)                                                             |
| `./src/hooks`      | Contains the custom React hooks of the frontend, see [Custom Hooks](#custom-hooks)                                                                 |

| File                   | Description                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `./src/middleware.ts`  | Contains the middleware of the frontend, see [Authentication](#authentication) |
| `./tailwind.config.js` | Contains the Tailwind CSS configuration, see [Styling](#styling)               |
| `./next.config.js`     | Contains the Next.js configuration, see [Next.js](#next-js)                    |

::: warning
Explain the difference between the `./src/app` and `./src/pages` folders. Migrate API to app folder.
:::

## Next.js

The frontend is developed using [Next.js](https://nextjs.org/).

## Styling

We are using Tailwind CSS for styling. The Tailwind CSS configuration is located in the `frontend/tailwind.config.js`

::: warning
Explain how the dark mode is implemented.
:::

::: warning
Mention Icon Library and other resources
:::

## Component Library

The frontend is styled using our own component library, which is located in the
`frontend/src/components` folder. The components are written in TypeScript and use [React](https://reactjs.org/)
and [Tailwind CSS](https://tailwindcss.com/).

::: warning
Explain how the component library is structured, especially the `@***` import notation
:::

::: warning
Explain the usage of Storybook, and mention the `.storybook` folder
:::

## Authentication

The frontend is using [NextAuth.js](https://next-auth.js.org/) for authentication. It is configured in the
`frontend/src/pages/api/auth/[...nextauth].ts` file. We are supporting authentication
via [Google](https://google.com/), [CeviDB](https://db.cevi.ch/) and [MiData](https://db.scout.ch/). As well as
authentication via email and password.

Next-Auth is using [Pisma](https://www.prisma.io/) to interact directly with the database.

::: warning
Explain the authentication flow; describe decision to use Session authentication instead of JWT.
Link to the backend documentation, prisma...
:::

## GraphQL - Apollo Client

The frontend is using [Apollo Client](https://www.apollographql.com/docs/react/) to interact with the GraphQL API. We
are using [GraphQL Code Generator](https://graphql-code-generator.com/) to generate the TypeScript types for the API.
The operations are defined in the `frontend/src/graphql` folder.

::: warning
Link to the docs for the backend, explain how to add new operations, etc.
:::

## Custom Hooks

::: warning
Document the custom react hooks.
:::

::: warning
rename the folder from `hocks` to `hooks`
:::
