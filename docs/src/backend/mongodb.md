# Primary Database - MongoDB

::: info
You can connect to the database using MongoDB Compass at [mongodb://localhost:27017](mongodb://localhost:27017).
Make sure to use the `eMeal_menuplanung` database and the `user` user. Credentials are configured in the
environment file: [Learn more](/docs/development-environment#environment-variables).
:::

We are using MongoDB as our primary database. It is used to store the data of the users and the recipes.
In order to get typed access to the database, we are using [Prisma](https://www.prisma.io/) as an ORM. For that we
define the schema of the database in the `common/prisma` folder. The schema is then used to generate
the Prisma client. The Prisma client is used to interact with the database.

## MongoDB Replica Set

Prisma requires a MongoDB instance running in replica set mode. Your docker environment should automatically start a
MongoDB instance in replica set mode, nevertheless we are using a single MongoDB instance. More details can be found in
the [Prisma documentation](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/mongodb-node-mongodb#prerequisites).

## Persistent Data

We are using Docker volumes to persist the data of the database. The volumes are defined in the
`docker-compose.yml` file. You can reset the database by removing the volumes:

```bash
docker-compose down --volumes
```

## MongoDB Compass

::: warning
Explain how to connect to the database using MongoDB Compass.
:::
