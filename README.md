# DAAPIService

Drinkol App API Service

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
