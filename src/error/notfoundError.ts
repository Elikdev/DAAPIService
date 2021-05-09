import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {BaseError} from "./baseError";

export class ResourceNotFoundError extends BaseError {
  code: number
  name: string

  constructor(args: string | undefined) {
    super(args);
    this.name = ReasonPhrases.NOT_FOUND;
    this.code = StatusCodes.NOT_FOUND;
  }
}