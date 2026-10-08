#!/bin/sh
# Builds the cloud functions, keeps rebuilding them on changes and starts the emulator suite.
set -e

cd /workspace/backend/firebase-cloud-functions/functions

# (re)install the dependencies if package-lock.json is newer than the last installation
if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  npm ci --no-audit --no-fund
fi

npx tsc
npx tsc --watch --preserveWatchOutput &

cd ..
exec firebase emulators:start --config firebase.emulator.json --project "${GCLOUD_PROJECT}"
