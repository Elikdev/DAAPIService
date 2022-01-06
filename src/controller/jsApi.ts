import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { getToken } from "./helper/jssdkHelper";

export class JsApiController {
  @HandleError("getToken")
  static async getToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const result = await getToken();
    res.send({
      data: result,
    });
  }
}
