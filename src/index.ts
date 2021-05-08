import express from "express";
import {Request, Response} from "express";
import { logger } from "./logging/logger";
import "reflect-metadata";
import {createConnection} from "typeorm";
import {DBConfig} from "./config/dbconfig";
import bodyParser from "body-parser";
import rTracer from "cls-rtracer";

createConnection(DBConfig).then(async connection => {
  logger.debug(`DB connection established with options: ${JSON.stringify(connection.options)}`);

  const PORT = 4000;

  const app = express();
  app.use(bodyParser.json());
  app.use(rTracer.expressMiddleware());

  app.listen(PORT, () => {
    logger.info(`>>>>> Hello: DAAPIServer is running on port=${PORT} <<<<<`);
  });

  app.get("/health", (req: Request, res: Response) => res.send("Serivce is healthy."));

}).catch(error => console.log(error));



