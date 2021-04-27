import express from "express";
import {Request, Response} from "express";
import "reflect-metadata";
import {createConnection} from "typeorm";
import {DBConfig} from "./config/dbconfig";

createConnection(DBConfig).then(async connection => {

  const PORT = 4000;

  const app = express();
  app.listen(PORT, () => {
    console.log(`>>> Hello: DAAPIServer is running on port ${PORT} <<<`);
  });

  app.get("/health", (req: Request, res: Response) => res.send("Serivce is healthy."));

}).catch(error => console.log(error));



