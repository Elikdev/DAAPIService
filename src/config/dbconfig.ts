import {ConnectionOptions} from "typeorm";

export const getDBConfig = ():ConnectionOptions => {
  const APP_ENV = process.env.APP_ENV;
  switch(APP_ENV) {
  case "development":
    return DevDBConfig;
  case "test": 
    return TestDBConfig;
  default:
    return DevDBConfig;
  }
};

export const DevDBConfig:ConnectionOptions = {
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

export const TestDBConfig:ConnectionOptions = {
  "type": "postgres",
  "host": "postgresdb",
  "port": 5432,
  "username": "postgres",
  "password": "password",
  "database": "da_test",
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


