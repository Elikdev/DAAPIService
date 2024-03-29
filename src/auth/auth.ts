import { NextFunction, Request, Response } from "express";
import { AuthError } from "../error/authError";
import { ErrorHandler } from "../error/errorHandler";
import { logger } from "../logging/logger";
import { JwtHelper } from "./jwt";

const TEST_CUSTOMER_ID = 1;
const BYPASS_AUTH_PATH = ["/discoverItems"];
const BYPASS_REGEX_PATH = /\/items\/[\w\W]+\/suggest/;

export const authMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authorization = req.headers.authorization;
  try {
    if (!authorization) {
      logger.error("Authorization token is not present.");
      throw new AuthError("Authorization token is not present.");
    }
    const authToken = authorization.split(" ")[1];
    const decodedToken = JwtHelper.verify(authToken);
    req.body.userId = decodedToken.customerId;
    logger.debug(
      "Wechat auth token verified. Customer Id is :" + decodedToken.customerId,
    );
    return next();
  } catch (err) {
    if (shouldBypassAuth(req.path)) {
      logger.info(
        "Override is true, bypassing auth. Setting customerId to test customerId: " +
          TEST_CUSTOMER_ID,
      );
      if (process.env.APP_ENV !== "production") {
        req.body.userId = TEST_CUSTOMER_ID;
      }
      return next();
    } else {
      logger.error(
        "Getting error while decoding wechat miniprogram auth token:",
        err,
      );
      ErrorHandler.handle(res, new AuthError("Authorization error"));
    }
  }
};

export const shouldBypassAuth = (path: string): boolean => {
  if ("true" === process.env.AUTH_OVERRIDE) {
    return true;
  } else {
    if (BYPASS_AUTH_PATH.includes(path)) {
      return true;
    }
    if (path.match(BYPASS_REGEX_PATH)) {
      return true;
    }
    return false;
  }
};
