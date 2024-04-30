# Prepare the database
export PRISMA_OUTPUT="../../backend/graphQL/src/util/generated/prisma/client/"
dotenv -e "$ENV_FILE_PATH" -- npx prisma generate --schema=../../common/prisma/schema.prisma
dotenv -e "$ENV_FILE_PATH" -- npx prisma db push --schema=../../common/prisma/schema.prisma

# Seed the database
dotenv -e "$ENV_FILE_PATH" -- npx prisma db seed

# Start Prisma Studio in the background
dotenv -e "$ENV_FILE_PATH" -- npx prisma studio --schema=../../common/prisma/schema.prisma &
# Generate the GraphQL schema types
dotenv -e "$ENV_FILE_PATH" -- npm run generate

# Create build.ts file with git information
sed -i 's/\\r//g' create_build_info.sh
source ./create_build_info.sh

# Start the GraphQL server
dotenv -e "$ENV_FILE_PATH" -- npm run dev