import express, { Router } from "express";
import {Request, Response} from "express";
import { logger } from "./logging/logger";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { getDBConfig } from "./config/dbconfig";
import rTracer from "cls-rtracer";
import { v1router } from "./v1router";
import * as dotenv from "dotenv";
import { payrouter } from "./payrouter";
import { messageRouter } from "./messageRouter";
import { createScheduledJobs } from "./scheduler/scheduler";
import cors from 'cors';

const PORT = 4000;
const DBConfig = getDBConfig();

createConnection(DBConfig).then(async connection => {
  setConfig();
  logger.debug(`DB connection established with options: ${JSON.stringify(connection.options)}`);
  
  createScheduledJobs();
  const app = express();
  app.use(rTracer.expressMiddleware());
  const router = Router();
  const allowedOrigins = ['https://www.admin.pbrick.cn', 'http://www.admin.pbrick.cn'];
  //options for cors midddleware
  const options: cors.CorsOptions = {
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'X-Access-Token',
      'Authorization',
      'Referer',
      'User-Agent'
    ],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: allowedOrigins,
    preflightContinue: false,
  };
  router.use(cors(options));
  app.listen(PORT);
  logger.info(`>>>>> Haven't felt like this in a longtime=${PORT} <<<<<`);
  
  app.use("/", router);

  app.get("/health", (req: Request, res: Response) => res.send("Serivce is healthy."));
  router.use("/v1", v1router);
  router.use("/pay", payrouter);
  router.use("/message", messageRouter);
}).catch(error => logger.error(error));


const setConfig = ():void => {
  const APP_ENV = process.env.APP_ENV;
  logger.info(`env is set to ${APP_ENV}.`);
  switch(APP_ENV) {
  case "development":
    dotenv.config({ path: __dirname+"/../.env" });
    break;
  case "test": 
    dotenv.config({ path: __dirname+"/../.env.test" });
    break;
  case "production": 
    dotenv.config({ path: __dirname+"/../.env.prod" });
    break;
  default:
    dotenv.config({ path: __dirname+"/../.env" });
  }
};