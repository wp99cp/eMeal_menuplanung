
echo "Wait for 20 seconds to make sure the MongoDB server is up and running..."
sleep 20

# Prepare the database
export PRISMA_OUTPUT="../../backend/graphQL/src/util/generated/prisma/client/"
dotenv -e "$ENV_FILE_PATH" -- npx prisma generate --schema=../../common/prisma/schema.prisma
dotenv -e "$ENV_FILE_PATH" -- npx prisma db push --schema=../../common/prisma/schema.prisma

# Generate the GraphQL schema types
dotenv -e "$ENV_FILE_PATH" -- npm run generate

# Start the GraphQL server
dotenv -e "$ENV_FILE_PATH" -- npm run dev