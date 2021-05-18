import {ConnectionOptions} from "typeorm";

export const DBConfig:ConnectionOptions = {
  "type": "postgres",
  "host": "host.docker.internal",
  "port": 5432,
  "username": "postgres",
  "password": "password",
  "database": "da_devo",
  "synchronize": true,
  "logging": ["error"],
  "entities": [
    "src/entities/**/*.ts"
  ],
  "migrations": [
    "src/migrations/**/*.ts"
  ],
  "subscribers": [
    "src/subscribers/**/*.ts"
  ],
  "cli": {
    "entitiesDir": "src/entities",
    "migrationsDir": "src/migrations",
    "subscribersDir": "src/subscribers"
  }
};



