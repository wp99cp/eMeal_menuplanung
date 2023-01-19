# export environment variables from .env file
set -a
# shellcheck disable=SC1090
source "$ENV_FILE_PATH"
set +a

# Prepare the database
dotenv -e "$ENV_FILE_PATH" -- npx prisma generate --schema=./src/prisma/schema.prisma
dotenv -e "$ENV_FILE_PATH" -- npx prisma db push

# Start the NextJS in dev mode
npm run lint
npm run dev
