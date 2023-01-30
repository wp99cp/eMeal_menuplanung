echo "Wait for MongoDB to be ready..."
until </dev/tcp/mongo-db/27018; do sleep 1; done

# Prepare the database
export PRISMA_OUTPUT="../../frontend/src/util/generated/prisma/client/"
dotenv -e "$ENV_FILE_PATH" -- npx prisma generate --schema=../common/prisma/schema.prisma
dotenv -e "$ENV_FILE_PATH" -- npx prisma db push --schema=../common/prisma/schema.prisma

# Generate the GraphQL schema types
dotenv -e "$ENV_FILE_PATH" -- npm run generate

# Start the NextJS in dev mode
# dotenv -e "$ENV_FILE_PATH" -- npm run lint

# Create build.ts file with git information
sed -i 's/\\r//g' create_build_info.sh
source ./create_build_info.sh

dotenv -e "$ENV_FILE_PATH" -- npm run dev
