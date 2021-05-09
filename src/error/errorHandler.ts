import { Response } from "express";
import { logger } from "../logging/logger";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

export class ErrorHandler {

  static handle(response: Response, error: any): void {
    const code = error.code || StatusCodes.INTERNAL_SERVER_ERROR;
    const name = error.name || "Unknown";
    const message = error.message || "None";

    if (this.isValidHttpCode(code)) {
      try {
        response.status(code).json({
          status: "ERROR",
          errorName: name,
          message: message
        });
      } catch(error) {
        logger.error("Unexpected error while handling error, closing connection.");
        response.end();
      }
    } else {
      logger.error("Unexpected error, return 500.");
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "ERROR",
        errorName: name,
        message: message
      });
    }
  }

  /**
   * Return false if this code is not found
   * @param code input http code
   */
  static isValidHttpCode(code: (number | string)): boolean {
    try {
      return !!getReasonPhrase(code);
    } catch {
      return false;
    }
  }
}
