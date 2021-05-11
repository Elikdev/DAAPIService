import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Users } from "../entities/Users";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { signUpSchema } from "../validator/schemas";

export class UserController {

  @HandleError("signUp")
  static async signUp(req: Request, res: Response): Promise<void> {
    // TODO: add complete logic
    const userData = req.body.data;
    const validator = new RequestValidator(signUpSchema);
    validator.validate(userData);
    
    const userId = req.body.userId;
    const userRepo = getRepository(Users);
    const user = await userRepo.findOne({id: userId});
    if (user) {
      throw new BadRequestError("User already exists.");
    }
    const savedUser = await userRepo.save(userData);
    logger.info("Finished registration");
    res.send({
      data: savedUser
    });
  }

  @HandleError("signIn")
  static async signIn(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const userRepo = getRepository(Users);
    const user = await userRepo.findOne({id: userId});
    if (!user) {
      throw new ResourceNotFoundError("User is not found.");
    }

    res.send({
      data: user
    });
  }
}