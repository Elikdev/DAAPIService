import { NextFunction, Request, Response } from "express";
import { AuthError } from "../error/authError";
import { ErrorHandler } from "../error/errorHandler";
import { logger } from "../logging/logger";
import { JwtHelper } from "./jwt";

const TEST_CUSTOMER_ID = 1;

export const authMiddleWare = (req: Request, res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;
  try {
    if (!authorization) {
      logger.error("Authorization token is not present.");
      throw new AuthError("Authorization token is not present.");
    }
    const authToken = authorization.split(" ")[1];
    const decodedToken = JwtHelper.verify(authToken);
    req.body.userId = decodedToken.customerId;
    
    logger.info("Wechat auth token verified.");
    logger.debug("CID is :", decodedToken.customerId);
    return next();
    
  } catch (err) {
    if (shouldBypassAuth()) {
      logger.info("Override is true, bypassing auth. Setting customerId to test customerId: " + TEST_CUSTOMER_ID);
      req.body.userId = TEST_CUSTOMER_ID;
      return next();

    } else {
      logger.error("Getting error while decoding wechat miniprogram auth token:", err);
      ErrorHandler.handle(res, err);
    }
  }
};

export const shouldBypassAuth = () : boolean => {
  return "true" === process.env.AUTH_OVERRIDE;
};
