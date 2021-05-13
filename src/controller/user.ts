import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { JwtHelper } from "../auth/jwt";
import { getOpenId } from "../auth/openId";
import { HandleError } from "../decorator/errorDecorator";
import { Users } from "../entities/Users";
import { AuthError } from "../error/authError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { signUpSchema } from "../validator/schemas";

export class UserController {

  @HandleError("signUp")
  static async signUp(req: Request, res: Response): Promise<void> {
    const userData = req.body.data;
    const validator = new RequestValidator(signUpSchema);
    validator.validate(userData);
    const userRepo = getRepository(Users);
    const code = userData.code;
    const openId = await getOpenId(code);

    let user = await userRepo.findOne({where: {openId: openId}});

    if (!user) {
      logger.info("Creating new user record.");
      userData.openId = openId;
      user = await userRepo.save(userData);
      if (!user) {
        throw new AuthError("Failed to create user.");
      }
    }

    const payload = {
      customerId: user.id
    };

    const accessToken = JwtHelper.sign(payload);

    res.send({
      data: {
        loginToken: accessToken
      }
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