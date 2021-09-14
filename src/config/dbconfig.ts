import { ConnectionOptions } from "typeorm";

export const getDBConfig = (): ConnectionOptions => {
  const APP_ENV = process.env.APP_ENV;
  switch (APP_ENV) {
    case "development":
      return DevDBConfig;
    case "test":
      return TestDBConfig;
    case "production":
      return ProdDBConfig;
    default:
      return DevDBConfig;
  }
};

export const DevDBConfig: ConnectionOptions = {
  type: "postgres",
  host: "host.docker.internal",
  port: 5432,
  username: "postgres",
  password: "password",
  database: "da_devo",
  synchronize: true,
  logging: ["error"],
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  cli: {
    entitiesDir: "src/entities",
    migrationsDir: "src/migrations",
    subscribersDir: "src/subscribers",
  },
};

export const TestDBConfig: ConnectionOptions = {
  type: "postgres",
  host: "pgm-uf63361v5rj57d2xwo.pg.rds.aliyuncs.com",
  port: 1921,
  username: "vintagedb",
  password: "ZR4uNjJswE4Yz",
  database: "dadb",
  synchronize: true,
  logging: ["error"],
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  cli: {
    entitiesDir: "src/entities",
    migrationsDir: "src/migrations",
    subscribersDir: "src/subscribers",
  },
};

// TODO: Disable synchronize and use migrations
export const ProdDBConfig: ConnectionOptions = {
  type: "postgres",
  host: "pgm-uf64m84wg1q2i630do.pg.rds.aliyuncs.com",
  port: 1921,
  username: "vintagedbprod",
  password: "BEYDGZJ3grT7w",
  database: "dadb",
  synchronize: true,
  logging: ["error"],
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  cli: {
    entitiesDir: "src/entities",
    migrationsDir: "src/migrations",
    subscribersDir: "src/subscribers",
  },
};
