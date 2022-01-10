import express, { Router } from "express";
import { Request, Response } from "express";
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
import cors from "cors";
import https from "https";
import * as http from "http";
import { getServerOptions } from "./config/serverconfig";
import * as socketio from "socket.io";

const PORT = 4000;
const HTTPS_PORT = 443;
const DBConfig = getDBConfig();
const httpsOptions = getServerOptions();

createConnection(DBConfig)
  .then(async (connection) => {
    setConfig();
    logger.debug(
      `DB connection established with options: ${JSON.stringify(
        connection.options,
      )}`,
    );

    createScheduledJobs();
    const app = express();
    app.use(rTracer.expressMiddleware());
    const router = Router();
    const allowedOrigins = [
      "https://www.admin.pbrick.cn",
      "http://www.admin.pbrick.cn",
      "https://www.share.pbrick.cn",
      "http://www.share.pbrick.cn",
      "http://www.event.pbrick.cn",
      "https://www.event.pbrick.cn",
    ];
    //options for cors midddleware
    const options: cors.CorsOptions = {
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "X-Access-Token",
        "Authorization",
        "Referer",
        "User-Agent",
      ],
      credentials: true,
      methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
      origin: allowedOrigins,
      preflightContinue: false,
    };

    if (httpsOptions) {
      // use https on the host for test environment
      https.createServer(httpsOptions, app).listen(HTTPS_PORT);
    } else {
      const server = http.createServer(app);
      server.listen(PORT, () => console.log(`server running on port ${PORT}`));
      const io = new socketio.Server(server);
      io.on("connection", (socket) => {
        logger.info("new ws connection");
        // Listen for Join room

        socket.on("joinRoom", (data: any) => {
          socket.emit("message", "欢迎" + data.username + "加入聊天！");
          //Broadcast when a user connects
          socket.broadcast.emit("message", `${data.username}加入了聊天!`);
        });

        // Listen for chat message
        socket.on("chat", (data: any) => {
          io.emit("message", data);
        });
      });
    }

    router.use(cors(options));
    logger.info(`>>>>> Haven't felt like this in a longtime=${PORT} <<<<<`);

    app.use("/", router);

    app.get(
      "/.well-known/apple-app-site-association",
      (req: Request, res: Response) => {
        res.set("Content-Type", "application/json");
        res.status(200).sendFile(__dirname + "/apple-app-site-association");
      },
    );

    app.get("/chat", (req: Request, res: Response) =>
      res.sendFile(__dirname + "/index.html"),
    );

    app.get("/health", (req: Request, res: Response) =>
      res.send("Serivce is healthy."),
    );
    router.use("/v1", v1router);
    router.use("/pay", payrouter);
    router.use("/message", messageRouter);
  })
  .catch((error) => logger.error(error));

const setConfig = (): void => {
  const APP_ENV = process.env.APP_ENV;
  logger.info(`env is set to ${APP_ENV}.`);
  switch (APP_ENV) {
    case "development":
      dotenv.config({ path: __dirname + "/../.env" });
      break;
    case "test":
      dotenv.config({ path: __dirname + "/../.env.test" });
      break;
    case "production":
      dotenv.config({ path: __dirname + "/../.env.prod" });
      break;
    default:
      dotenv.config({ path: __dirname + "/../.env" });
  }
};
