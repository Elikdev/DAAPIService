import {ConnectionOptions} from "typeorm";

export const DBConfig:ConnectionOptions = {
  "type": "postgres",
  "host": "postgresdb",
  "port": 5432,
  "username": "postgres",
  "password": "password",
  "database": "da_devo",
  "synchronize": true,
  "logging": false,
  "entities": [
    "src/entities/**/*.ts"
  ],
  "migrations": [
    "src/migration/**/*.ts"
  ],
  "subscribers": [
    "src/subscriber/**/*.ts"
  ],
  "cli": {
    "entitiesDir": "src/entities",
    "migrationsDir": "src/migration",
    "subscribersDir": "src/subscriber"
  }
};



