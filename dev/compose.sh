#!/bin/sh
# Runs `docker compose` for the local development environment (see docu/Local_Development.md)
# with the settings that are only known on the host.
set -e

cd "$(dirname "$0")/.."

# files created in the mounted repository should belong to the host user
HOST_UID="$(id -u)"
HOST_GID="$(id -g)"
export HOST_UID HOST_GID

# shown in the banner of the frontend, the containers have no access to the git repository
BUILD_GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2> /dev/null || echo unknown)"
BUILD_GIT_HASH="$(git rev-parse HEAD 2> /dev/null || echo unknown)"
export BUILD_GIT_BRANCH BUILD_GIT_HASH

exec docker compose "$@"
