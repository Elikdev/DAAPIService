import {ConnectionOptions} from "typeorm";

export const DBConfig:ConnectionOptions = {
  "type": "postgres",
  "host": "postgresdb",
  "port": 5432,
  "username": "postgres",
  "password": "password",
  "database": "drinkol",
  "synchronize": true,
  "logging": false,
  "entities": [
    "src/entity/**/*.ts"
  ],
  "migrations": [
    "src/migration/**/*.ts"
  ],
  "subscribers": [
    "src/subscriber/**/*.ts"
  ],
  "cli": {
    "entitiesDir": "src/entity",
    "migrationsDir": "src/migration",
    "subscribersDir": "src/subscriber"
  }
};
