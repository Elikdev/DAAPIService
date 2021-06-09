import express, { Router } from "express";
import {Request, Response} from "express";
import { logger } from "./logging/logger";
import "reflect-metadata";
import {createConnection} from "typeorm";
import {getDBConfig} from "./config/dbconfig";
import bodyParser from "body-parser";
import rTracer from "cls-rtracer";
import { v1router } from "./v1router";
import * as dotenv from "dotenv";
import https from "https";
import { getServerOptions } from "./config/serverconfig";

const PORT = 4000;
const DBConfig = getDBConfig();
const options = getServerOptions();

createConnection(DBConfig).then(async connection => {
  setConfig();
  logger.debug(`DB connection established with options: ${JSON.stringify(connection.options)}`);

  const app = express();
  app.use(bodyParser.json());
  app.use(rTracer.expressMiddleware());
  const router = Router();
  
  https.createServer(options, app).listen(PORT);
  logger.info(`>>>>> Haven't felt like this in a longtime=${PORT} <<<<<`);
  
  app.use("/", router);
  app.get("/health", (req: Request, res: Response) => res.send("Serivce is healthy."));
  router.use("/v1", v1router);

}).catch(error => console.log(error));

const setConfig = ():void => {
  const APP_ENV = process.env.APP_ENV;
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