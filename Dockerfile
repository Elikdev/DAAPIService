FROM node:14 as base

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm config set registry https://registry.npm.taobao.org

RUN npm install

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN npm run build

RUN npm ci --only=production