#!/bin/bash

# This script extracts the build information from the frontend

timestamp=$(date "+%a %b %d %Y %H:%M:%S GMT%z (%Z)")
version=$(node -pe "require('./package.json').version")

# check if .git directory exists and contains a HEAD file
if [ -f ".git/HEAD" ]; then
  git_commit=$(cat .git/"$(cut -d' ' -f2 <.git/HEAD)")
  git_branch=$(cut -d'/' -f3- <.git/HEAD)
else # set default values
  git_commit="unknown"
  git_branch="unknown"
fi

build_info="
const build = {
    version: \"${version}\",
    timestamp: \"${timestamp}\",
    message: null,
    git: {
        branch: \"${git_branch}\",
        hash: \"${git_commit:0:8}\"
    }
};
export default build;
"

# Write to file
echo "${build_info}" >./src/build.ts
