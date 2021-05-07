
## Build and Run the Container

In WSL run the following comand to build an run the docker container.

    docker build . -t exportcamp && docker run exportcamp

You can run the code locally using the following command:
    
    python script/pdf-generator.py {user_id} {camp_id} --optionalArgs

E.g.
    
    python script/pdf-generator.py CKsbjuHkJQUstW1YULeAepDe9Wl1 16fXu6siwVDX1OOb38P3 --dfn --lscp --mp



Please replace {user_id} and {camp_id} with the corresponding document ids. A full list of the optional
arguments can be found in [this collection](script/README.md).

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

