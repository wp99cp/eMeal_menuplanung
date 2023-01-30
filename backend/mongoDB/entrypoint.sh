# Export environment variables
set -o allexport
# shellcheck disable=SC1090
source "$ENV_FILE_PATH"
set +o allexport

# Create log file and directory
mkdir -p /var/log/mongo
touch /var/log/mongo/mongod.log

# Check if a key file exists

if [ ! -f /data/configdb/mongodb.keyfile ]; then
  echo "Key file not found. Creating a new one..."
  # Create keyfile

  # Create keyfile
  # TODO: we need to create this file in a persistent volume
  mkdir -p /etc/mongo
  openssl rand -base64 756 >/etc/mongo/mongodb.keyfile
  chmod 400 /etc/mongo/mongodb.keyfile

  # Copy the file into /data/configdb
  cp /etc/mongo/mongodb.keyfile /data/configdb/mongodb.keyfile

else
  echo "Key file found. Using the existing one..."
  cp /data/configdb/mongodb.keyfile /etc/mongo/mongodb.keyfile
fi

# Start the MongoDB server
/usr/bin/mongod --config /etc/mongo/mongo.conf

## Check if MongoDB is not already initialized
if [ ! -f /data/db/initialized ]; then

  # MongoDB is now running in the background
  echo "MongoDB is now running in the background"

  # Initialize the replica set
  echo "Initializing the replica set..."
  mongosh <<EOF
  rs.initiate();
EOF

  # Set up the user and password configured in .env file
  echo "Setting up the user and password... Starting with the root user..."
  mongosh <<EOF
  use admin;
  db.createUser(
    {
      user: 'admin',
      pwd: '$MONGO_DB_ROOT_PASSWORD',
      roles: [ { role: 'root', db: 'admin' } ]
    }
  );
EOF

  echo "And now the user for the database $MONGO_DATABASE..."
  mongosh -u admin -p "$MONGO_DB_ROOT_PASSWORD" <<EOF
  use admin;
  db.createUser({
    user: "$MONGO_DB_USERNAME",
    pwd: "$MONGO_DB_PASSWORD",
    roles: [
      {
        role: "readWrite",
        db: "$MONGO_DATABASE"
      }
    ]
  });
EOF

  # Create a file to indicate that MongoDB has been initialized
  touch /data/db/initialized

fi

# Notify that the container is ready to accept connections
nc -k -l 27018 > "Ready to accept connections"

# Keep the container running
# (otherwise it will exit as we have started MongoDB in the background)
tail -f /dev/null
