import { ServerOptions } from "https";
import fs from "fs";

export const getServerOptions = ():ServerOptions|null => {
  const APP_ENV = process.env.APP_ENV;
  switch(APP_ENV) {
  case "test": 
    return {
      key: fs.readFileSync("ssl/5752003_www.integ.lt.pbrick.cn.key"),
      cert: fs.readFileSync("ssl/5752003_www.integ.lt.pbrick.cn.pem")
    };
  default:
    return null;
  }
};