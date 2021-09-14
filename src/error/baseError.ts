import { ReasonPhrases, StatusCodes } from "http-status-codes";

export class BaseError extends Error {
  code: number;
  name: string;

  constructor(args: string | undefined) {
    super(args);
    this.name = ReasonPhrases.INTERNAL_SERVER_ERROR;
    this.code = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}
