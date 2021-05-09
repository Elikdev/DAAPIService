import { StatusCodes } from "http-status-codes";
import {BaseError} from "./baseError";

export class ValidationError extends BaseError {
  code: number
  name: string

  constructor(args: string | undefined) {
    super(args);
    this.name = "ValidationError";
    this.code = StatusCodes.BAD_REQUEST;
  }
}