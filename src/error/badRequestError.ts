import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { BaseError } from "./baseError";

export class BadRequestError extends BaseError {
  code: number;
  name: string;

  constructor(args: string | undefined) {
    super(args);
    this.code = StatusCodes.BAD_REQUEST;
    this.name = ReasonPhrases.BAD_REQUEST;
  }
}
