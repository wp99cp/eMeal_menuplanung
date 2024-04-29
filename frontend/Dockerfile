FROM node:22
WORKDIR /app/frontend

# Install app dependencies
COPY ./frontend/package.json ./frontend/package-lock.json ./

# Install all the dependencies from package-lock.json
RUN npm ci
RUN npm install -g dotenv-cli

# Copy project directory
COPY ./frontend ./
COPY ./common /app/common

ENTRYPOINT ["bash", "entrypoint.sh"]