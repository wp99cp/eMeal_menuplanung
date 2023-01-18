#!/bin/bash
echo "sleeping for 10 seconds"
sleep 10

mongosh --host mongo-db:27017 <<EOF
  var cfg = {
    "_id": "rs0",
    "version": 1,
    "members": [
      {
        "_id": 0,
        "host": "mongo-db:27017",
        "priority": 2
      }
    ]
  };
  rs.initiate(cfg);
EOF
