FROM node:18
WORKDIR /app

# Install app dependencies
COPY ./package.json ./package-lock.json ./

# Install all the dependencies from package-lock.json
RUN npm ci
RUN npm install -g dotenv-cli

# Copy project directory
COPY ./ /app/

ENTRYPOINT ["bash", "entrypoint.sh"]
