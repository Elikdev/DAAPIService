import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { JwtHelper } from "../auth/jwt";
import { getSessionData } from "../auth/wxSessionData";
import { HandleError } from "../decorator/errorDecorator";
import { Users } from "../entities/Users";
import { AuthError } from "../error/authError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { signUpSchema, updateUserSchema } from "../validator/schemas";
import { Decode } from "./helper/wxDecode";
import { Constants } from "../config/constants";

export class UserController {

  @HandleError("signUp")
  static async signUp(req: Request, res: Response): Promise<void> {
    const validator = new RequestValidator(signUpSchema);
    const userData = req.body.data;
    const code = userData.code;
    const sessionData = await getSessionData(code);
    validator.validate(userData);
    const encryptedData = userData.encryptedData;
    const iv  = userData.iv;
    const encryptedDataDecoder = new Decode(sessionData.session_key);
    const userRepo = getRepository(Users);
    const openId = sessionData.openid;
    const userInfo = encryptedDataDecoder.decryptData(encryptedData, iv);
    
    let user = await userRepo.createQueryBuilder("user")
      .where("user.openId = :openId", { openId: openId })
      .leftJoinAndSelect("user.shops", "shops")
      .leftJoinAndSelect("user.itemLikes", "itemLikes")
      .leftJoinAndSelect("itemLikes.item", "likedItem")
      .leftJoinAndSelect("user.itemSaves", "itemSaves")
      .leftJoinAndSelect("itemSaves.item", "savedItem")
      .loadRelationCountAndMap("user.itemLikesCount", "user.itemLikes")
      .loadRelationCountAndMap("user.itemSavesCount", "user.itemSaves")
      .getOne();

    if (!user) {
      logger.info("Creating new user record.");
      userData.openId = openId;
      userData.mobilePrefix = userInfo.countryCode;
      userData.mobile = userInfo.phoneNumber;
      userData.username = userInfo.phoneNumber;
      userData.role = Constants.SHOPPER;
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
      loginToken: accessToken,
      userInfo: user
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


  @HandleError("updateUser")
  static async updateUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const userData = req.body.data;

    const validator = new RequestValidator(updateUserSchema);
    validator.validate(userData);

    const userRepo = await getRepository(Users);
    const result = await userRepo.createQueryBuilder()
      .update(Users, userData)
      .where("id = :id", { id: userId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then(response => response.raw[0]);

    
    if (!result) {
      throw new ResourceNotFoundError("User not found.");
    }
    res.send({
      data: result
    });

  }


  @HandleError("GetUser")
  static async getUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const userRepo = await getRepository(Users);
    const result = await userRepo.createQueryBuilder("users")
      .where("users.id = :id", { id: userId })
      .leftJoinAndSelect("users.shops", "shops")
      .select(["shops.id", "shops.name", "shops.introduction", "shops.location", "shops.logoUrl", "users.id", "users.username", "users.followersCount", "users.followingsCount", "users.avatarUrl", "users.introduction"])
      .getOne();
    
    if (!result) {
      throw new ResourceNotFoundError("User not found.");
    }
    res.send({
      data: result
    });

  }

}