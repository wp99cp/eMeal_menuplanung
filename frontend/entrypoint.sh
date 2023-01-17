# export environment variables from .env file
set -o allexport
# shellcheck disable=SC1090
source "$ENV_FILE_PATH"
set +o allexport

npx prisma generate --schema=./src/prisma/schema.prisma
npx prisma db push

npm run dev
