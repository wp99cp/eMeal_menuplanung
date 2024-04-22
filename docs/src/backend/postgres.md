# Primary Database - PostgresSQL

We are using Docker volumes to persist the data of the database. The volumes are defined in the
`docker-compose.yml` file. You can reset the database by removing the volumes:

```bash
docker-compose down --volumes
```
