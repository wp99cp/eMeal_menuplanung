# export environment variables from .env file
set -a
# shellcheck disable=SC1090
source "$ENV_FILE_PATH"
set +a

npm run dev