echo "Wait for 20 seconds to make sure the MongoDB server is up and running..."
sleep 20

# Prepare the database
dotenv -e "$ENV_FILE_PATH" -- npx prisma generate --schema=./src/prisma/schema.prisma
dotenv -e "$ENV_FILE_PATH" -- npx prisma db push --schema=./src/prisma/schema.prisma

# Start the NextJS in dev mode
dotenv -e "$ENV_FILE_PATH" -- npm run lint

# Create build.ts file with git information
sed -i 's/\\r//g' create_build_info.sh
source ./create_build_info.sh

dotenv -e "$ENV_FILE_PATH" -- npm run dev
