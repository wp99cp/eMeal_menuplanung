# Project Structure of eMeal - Menüplanung

The project is structured into several folders. Each folder contains code for a specific part of the project. The
following sections gibe an overview of the project structure and its services.

## Frontend

::: tip The Frontend is Exposed on Port 3000
The frontend can be accessed at as webpage via [http://localhost:3000](http://localhost:3000).
:::

The frontend is developed using [Next.js](https://nextjs.org/) together with [React](https://reactjs.org/). It is
written in [TypeScript](https://www.typescriptlang.org/). All the frontend code is located in the `frontend` folder.

More information about the frontend can be found in the [frontend section](/frontend/).

## Backend Services

The `backend` folder contains various backend services. These include among others the [GraphQL-Server](#),
the [MongoDB database](#), as well as the [print service](#).

::: tip GraphQL API lives on Port 4000
When running the project locally, the GraphQL API Sandbox can be accessed
at [http://localhost:4000/graphql](http://localhost:4000/graphql).
:::

::: tip Prisma Studio lives on Port 5555
When running the project locally, Prisma Studio can be accessed
at [http://localhost:5555](http://localhost:5555).
:::

## Common Folder

The `common` folder contains code that is shared between the frontend and the backend. Currently, it is holding the
schema of the GraphQL API and the [Prisma](https://www.prisma.io/) schema.

## Documentation

::: tip The Documentation is Exposed on Port 8000
The documentation can be accessed at [http://localhost:8000](http://localhost:8000).
:::

The `docs` folder contains the documentation of the project. It is written in Markdown and built using
[VitePress](https://vitepress.vuejs.org/). You are currently reading the documentation.

More information about the documentation can be found in the [documentation section](/docs/).

## Tests

Finally, the `tests` folder contains the various tests of the project. End-to-end tests are written using
[Cypress](https://www.cypress.io/). Unit tests are written using ???.

::: warning
Add more information about the tests
:::
