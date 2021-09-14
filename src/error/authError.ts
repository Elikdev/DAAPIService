import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { BaseError } from "./baseError";

export class AuthError extends BaseError {
  code: number;
  name: string;

  constructor(args: string | undefined) {
    super(args);
    this.name = ReasonPhrases.UNAUTHORIZED;
    this.code = StatusCodes.UNAUTHORIZED;
  }
}
