# DAAPIService

Drinkol App API Service

## Build image
`docker build --pull --rm -f "Dockerfile" -t daapiservice:latest "."`

## Run container 
`docker run --rm -d  -p 8080:8080/tcp daapiservice:latest`