import { StatusCodes } from "http-status-codes";
import { BaseError } from "./baseError";

export class DependencyError extends BaseError {
  code: number;
  name: string;

  constructor(args: string | undefined) {
    super(args);
    this.code = StatusCodes.INTERNAL_SERVER_ERROR;
    this.name = "Dependency failure.";
  }
}
