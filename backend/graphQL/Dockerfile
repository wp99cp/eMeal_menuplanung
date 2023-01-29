FROM node:18
WORKDIR /app/backend/graphQL

# Install app dependencies
COPY ./backend/graphQL/package.json ./backend/graphQL/package-lock.json ./

# Install all the dependencies from package-lock.json
RUN npm ci
RUN npm install -g dotenv-cli

# Copy project directory
COPY ./backend/graphQL ./
COPY ./common /app/common

ENTRYPOINT ["bash", "entrypoint.sh"]
