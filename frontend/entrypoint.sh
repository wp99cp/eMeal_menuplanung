echo "Wait for MongoDB to be ready..."
# shellcheck disable=SC2188
until </dev/tcp/mongo-db/27018; do sleep 1; done

# Generates the Prisma client for the frontend
# We use Prisma for NextAuth, all other operations are done via the backend graphql server
export PRISMA_OUTPUT="../../frontend/src/util/generated/prisma/client/"
dotenv -e "$ENV_FILE_PATH" -- npx prisma generate --schema=../common/prisma/schema.prisma

# Generate the GraphQL schema types
dotenv -e "$ENV_FILE_PATH" -- npm run generate

# Create build.ts file with git information
sed -i 's/\\r//g' create_build_info.sh
source ./create_build_info.sh

dotenv -e "$ENV_FILE_PATH" -- npm run storybook &
dotenv -e "$ENV_FILE_PATH" -- npm run dev