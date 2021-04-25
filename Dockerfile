FROM node:14 as base

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
RUN npm run lint-and-fix
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build
