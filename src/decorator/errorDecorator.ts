import { Request, Response } from "express";
import { ErrorHandler } from "../error/errorHandler";
import { logger } from "../logging/logger";

export const HandleError = (funcName: string): any => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Save a reference to the original method
    const originalMethod = descriptor.value;

    // Rewrite original method with try/catch wrapper
    descriptor.value = function (...args: [Request, Response]) {
      try {
        const result = originalMethod.apply(this, args);

        // Check if method is asynchronous
        if (result && result instanceof Promise) {
          // Return promise
          return result.catch((error: any) => {
            logger.error(`Encountered problem calling ${funcName}:`, error);
            ErrorHandler.handle(args[1], error);
          });
        }

        // Return actual result
        return result;
      } catch (error) {
        logger.error(`Encountered problem calling ${funcName}:`, error);
        ErrorHandler.handle(args[1], error);
      }
    };
    return descriptor;
  };
};
