FROM node:18
WORKDIR /app

# Install app dependencies
COPY ./package.json ./package-lock.json ./

# Install all the dependencies from package-lock.json
RUN npm ci

# Copy project directory
COPY ./ /app/

CMD ["npm", "run", "dev"]