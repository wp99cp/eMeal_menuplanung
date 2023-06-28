# Project Structure of eMeal - Menüplanung

The project is structured into several folders. Each folder contains code for a specific part of the project. The
following sections describe the different parts of the project.

## Frontend

::: info
The frontend can be accessed at as webpage via [http://localhost:3000](http://localhost:3000).
:::

The frontend is developed using [Next.js](https://nextjs.org/) together with [React](https://reactjs.org/). It is
written in [TypeScript](https://www.typescriptlang.org/). All the frontend code is located in the `frontend` folder.

#### Styling and Component Library

The frontend is styled using our own component library, which is located in the `frontend/src/components` folder. The
components are written in TypeScript and use [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

#### Authentication

The frontend is using [NextAuth.js](https://next-auth.js.org/) for authentication. It is configured in the
`frontend/src/pages/api/auth/[...nextauth].ts` file. We are supporting authentication
via [Google](https://google.com/), [CeviDB](https://db.cevi.ch/) and [MiData](https://db.scout.ch/). As well as
authentication via email and password.

#### API Interaction using GraphQL (Apollo Client)

The frontend is using [Apollo Client](https://www.apollographql.com/docs/react/) to interact with the GraphQL API. We
are using [GraphQL Code Generator](https://graphql-code-generator.com/) to generate the TypeScript types for the API.
The operations are defined in the `frontend/src/graphql` folder.

Next-Auth is using [Pisma](https://www.prisma.io/) to interact directly with the database.

## Backend

The `backend` folder contains various backend services. These include the [GraphQL API](https://graphql.org/) and
the [MongoDB](https://www.mongodb.com/) database. As well as some other services, e.g. the print service.

### GraphQL API

::: info
The GraphQL API can be accessed at [http://localhost:4000/graphql](http://localhost:4000/graphql). If you are visiting
this URL in your browser, you will see a GraphQL Playground, which allows you to interact with the API.
:::

The graphql API is developed using [Apollo Server](https://www.apollographql.com/docs/apollo-server/). It is written in
TypeScript using GraphQL Code Generator to generate a type-safe API. The schema of the GraphQL API is defined in
the `common/graphQL` folder.

#### Authentication

All requests to the GraphQL API must be authenticated. Two types of authentication are supported: Session and API Keys.

- Session authentication is used for the frontend. The frontend is using [NextAuth.js](https://next-auth.js.org/) to
  authenticate the user. The NextAuth.js session is passed to the GraphQL API.
- API Key authentication is used for other backend services (e.g. the print service). The print service is using an API
  Key to authenticate itself. The API Key is passed using the HTTP header `x-api-key`. Optionally, a user_id can be
  passed using the HTTP header `x-user-id`. The latter is used to impersonate a user.

If you are using the GraphQL Playground, you can use an API Key to authenticate yourself.

### Primary Database - MongoDB & Prisma

::: info
You can connect to the database using MongoDB Compass at [mongodb://localhost:27017](mongodb://localhost:27017).
Make sure to use the `eMeal_menuplanung` database and the `user` user. Credentials are configured in the
environment file: [Learn more](/docs/development-environment#environment-variables).
:::

We are using MongoDB as our primary database. It is used to store the data of the users and the recipes.
In order to get typed access to the database, we are using [Prisma](https://www.prisma.io/) as an ORM. For that we
define the schema of the database in the `common/prisma` folder. The schema is then used to generate
the Prisma client. The Prisma client is used to interact with the database.

#### MongoDB Replica Set

Prisma requires a MongoDB instance running in replica set mode. Your docker environment should automatically start a
MongoDB instance in replica set mode, nevertheless we are using a single MongoDB instance. More details can be found in
the [Prisma documentation](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/mongodb-node-mongodb#prerequisites).

#### Usage of Prisma Extensions

As of Prisma 4.16.0, Prisma
supports [extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions). Extensions allow
to add custom functionality to the Prisma client. To follow common patterns, we have decided to not use such extensions
only for specific use cases:

- For logging and performance monitoring
- Implementing something like [soft delete](https://zenstack.dev/blog/prisma-client-extensions#1-soft-delete)
- Setting up change listeners for serving GraphQL subscriptions, e.g. we could hock into every write operation and
  trigger an update to all active subscriptions using pubsub.
- Enforcing access control

However, we do not plan to use extensions to implement business logic. For example, we will not use extensions for
implementing complex database transactions like adding a meal to a specific camp, implementing queries like fetching all
meals of a camp or for complex aggregations like creating the shopping list / week view of a camp, as those operations
are only used within a single graphql resolver.

#### Persistent Data

We are using Docker volumes to persist the data of the database. The volumes are defined in the
`docker-compose.yml` file. You can reset the database by removing the volumes:

```bash
docker-compose down --volumes
```

### Print Service

::: warning
The print service is currently not working. It is not yet implemented.
:::

::: info
The print service can be accessed at [http://localhost:5000](http://localhost:5000).
:::

The print service is used to generate printable PDFs of the menu plan. It is written in Python
using [Flask](https://flask.palletsprojects.com/). It is using [PyLaTeX](https://jeltef.github.io/PyLaTeX/current/)
to generate the PDFs.

## Common Folder

The `common` folder contains code that is shared between the frontend and the backend. Currently, it is holding the
schema of the GraphQL API and the [Prisma](https://www.prisma.io/) schema.

## Documentation

::: info
The documentation can be accessed at [http://localhost:8000](http://localhost:8000).
:::

The `docs` folder contains the documentation of the project. It is written in Markdown and built using
[VitePress](https://vitepress.vuejs.org/). You are currently reading the documentation.

::: tip
More information about the documentation can be found in the [documentation section](/docs/).
:::

## Tests

Finally, the `tests` folder contains the various tests of the project. End-to-end tests are written using
[Cypress](https://www.cypress.io/). Unit tests are written using ???.