# export environment variables from .env file
set -a
# shellcheck disable=SC1090
source "$ENV_FILE_PATH"
set +a

ls -a

# Prepare the database
dotenv -e "$ENV_FILE_PATH" -- npx prisma generate --schema=./src/prisma/schema.prisma
dotenv -e "$ENV_FILE_PATH" -- npx prisma db push --schema=./src/prisma/schema.prisma

dotenv -e "$ENV_FILE_PATH" -- npm run dev