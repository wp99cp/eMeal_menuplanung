# Export environment variables
set -o allexport
# shellcheck disable=SC1090
source "$ENV_FILE_PATH"
set +o allexport

# Create log file and directory
mkdir -p /var/log/mongo
touch /var/log/mongo/mongod.log

# Create keyfile
# TODO: we need to create this file in a persistent volume
mkdir -p /etc/mongo
openssl rand -base64 756 >/etc/mongo/mongodb.keyfile
chmod 400 /etc/mongo/mongodb.keyfile

# Clear old Data
rm -rf /data/configdb
rm -rf /data/db

# Start the MongoDB server
/usr/bin/mongod --config /etc/mongo/mongo.conf

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

# Keep the container running
# (otherwise it will exit as we have started MongoDB in the background)
tail -f /dev/null
