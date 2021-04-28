# DAAPIService

NodeJS + Express + TypeScript + TypeORM + Docker + Postgres API Service 

### Reference

https://medium.com/@rcuni8/create-expressjs-server-with-typeorm-and-postgres-using-docker-and-docker-compose-66f1ebc9d94b

https://nodejs.org/en/docs/guides/nodejs-docker-webapp/#create-the-node-js-app

https://typeorm.io/#/

## Install packages and run
`npm install`
`npm run build`
`npm run dev`

## Build image
`docker-compose build`

## Run container 
`docker-compose up -d`

## Tail logs
`docker logs -f <container_id>`

## Access container
`docker exec -it <container_id> /bin/bash`

## Run with prod config
`docker-compose -f docker-compose.yml -f docker-compose.prod.yml up`

## Down
`docker-compose down`
## run db migration
`npm run typeorm:cli -- migration:run`

## generate db migration
`npm run typeorm:cli -- migration:generate -n [name]`
## type-orm-model-generator
1. npm i -g typeorm-model-generator
2. run npx typeorm-model-generator -h localhost -d da_devo -p 5432 -u postgres -x password -e postgres -o entities --noConfig true --ce pascal --cp camel
