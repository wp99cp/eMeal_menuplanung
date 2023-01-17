# Export environment variables
set -o allexport
# shellcheck disable=SC1090
source "$ENV_FILE_PATH"
set +o allexport

# Create keyfile
openssl rand -base64 756 > /database.key
chmod 400 /database.key

# Run the mongo entrypoint script
/usr/bin/mongod --replSet rs0 --bind_ip_all