
## Build and Run the Container

In WSL run the following comand to build an run the docker container.
```  docker build . -t exportcamp && docker run exportcamp ```



## Setup

1) Add key files to a folder ```./keys/```. Firebase Admin SDK keys and a custom influxdb key file, containing:

```json
{
  "host": ...,
  "port": ...,
  "username": ...,
  "password": ...,
  "database": ...
}
```

