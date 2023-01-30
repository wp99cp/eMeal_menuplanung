echo "Wait for MongoDB to be ready..."
until </dev/tcp/mongo-db/27018; do sleep 1; done

# Prepare the database
export PRISMA_OUTPUT="../../backend/graphQL/src/util/generated/prisma/client/"
dotenv -e "$ENV_FILE_PATH" -- npx prisma generate --schema=../../common/prisma/schema.prisma
dotenv -e "$ENV_FILE_PATH" -- npx prisma db push --schema=../../common/prisma/schema.prisma

# Start Prisma Studio in the background
dotenv -e "$ENV_FILE_PATH" -- npx prisma studio --schema=../../common/prisma/schema.prisma &

# Generate the GraphQL schema types
dotenv -e "$ENV_FILE_PATH" -- npm run generate

# Start the GraphQL server
dotenv -e "$ENV_FILE_PATH" -- npm run dev
