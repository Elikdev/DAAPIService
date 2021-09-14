import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { JwtHelper } from "../auth/jwt";
import { getSessionData, getUserInfo} from "../auth/wxSessionData";
import { HandleError } from "../decorator/errorDecorator";
import { Users } from "../entities/Users";
import { AuthError } from "../error/authError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { signUpSchema, updateUserSchema, appSignUpSchema } from "../validator/schemas";
import { Decode } from "./helper/wxDecode";
import { Constants } from "../config/constants";
import { Platform } from "../entities/Users";

export class UserController {

  @HandleError("signUp")
  static async signUp(req: Request, res: Response): Promise<void> {
    const userData = req.body.data;
    const platform = userData.platform;
    const userRepo = getRepository(Users);

    if (platform === Platform.APP) { // login from app
      const validator = new RequestValidator(appSignUpSchema);
      validator.validate(userData);
      const code = userData.code;
      const userInfo = await getUserInfo(code);
      let user = await userRepo.createQueryBuilder("user")
        .where("user.unionId = :unionId", { unionId: userInfo.unionid })
        .leftJoinAndSelect("user.shops", "shops")
        .leftJoinAndSelect("user.itemLikes", "itemLikes")
        .leftJoinAndSelect("itemLikes.item", "likedItem")
        .leftJoinAndSelect("user.itemSaves", "itemSaves")
        .leftJoinAndSelect("itemSaves.item", "savedItem")
        .loadRelationCountAndMap("user.itemLikesCount", "user.itemLikes")
        .loadRelationCountAndMap("user.itemSavesCount", "user.itemSaves")
        .getOne();
      let newUser = false;
      if (!user) {
        logger.info("Creating new user record.");
        userData.openId = userInfo.openid;
        userData.username = userInfo.nickname;
        userData.role = Constants.SHOPPER;
        userData.unionId = userInfo.unionid;
        userData.avatarUrl = userInfo.headimgurl;
        userData.sex = userInfo.sex;
        userData.platform = Platform.APP;
        user = await userRepo.save(userData);
        if (!user) {
          throw new AuthError("Failed to create user.");
        }
        newUser = true;
      }

      const payload = {
        customerId: user.id
      };

      const accessToken = JwtHelper.sign(payload);

      res.send({
        loginToken: accessToken,
        userInfo: user,
        newUser: newUser
      });

    } else {
      const validator = new RequestValidator(signUpSchema);

      const code = userData.code;
      const sessionData = await getSessionData(code);

      validator.validate(userData);
      const encryptedData = userData.encryptedData;
      const iv  = userData.iv;
      const encryptedDataDecoder = new Decode(sessionData.session_key);
      const openId = sessionData.openid;
      const unionId = sessionData.unionid;

      logger.info("Decrypting user data with session_key:" + sessionData.session_key);
      const userInfo = encryptedDataDecoder.decryptData(encryptedData, iv);
      let user = await userRepo.createQueryBuilder("user") // check if user created through app first as app sign in only stores unionid 
        .where("user.unionId = :unionId", { unionId: unionId })
        .leftJoinAndSelect("user.shops", "shops")
        .leftJoinAndSelect("user.itemLikes", "itemLikes")
        .leftJoinAndSelect("itemLikes.item", "likedItem")
        .leftJoinAndSelect("user.itemSaves", "itemSaves")
        .leftJoinAndSelect("itemSaves.item", "savedItem")
        .loadRelationCountAndMap("user.itemLikesCount", "user.itemLikes")
        .loadRelationCountAndMap("user.itemSavesCount", "user.itemSaves")
        .getOne();
      
      let newUser = false;
      if (!user) { 
        user = await userRepo.createQueryBuilder("user")
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
          userData.unionId = unionId;
          user = await userRepo.save(userData);
        }
        if (!user) {
          throw new AuthError("Failed to create user.");
        }
        newUser = true;
      }
      user.unionId = unionId;
      user.platform = Platform.MINIPROGRAM;
      await user.save(); // back fill union Id
      const payload = {
        customerId: user.id
      };

      const accessToken = JwtHelper.sign(payload);

      res.send({
        loginToken: accessToken,
        userInfo: user,
        newUser: newUser
      });
    }

  }

  @HandleError("signIn")
  static async signIn(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const user = await Users.findOne({id: userId});
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

  @HandleError("getUser")
  static async getUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const userRepo = await getRepository(Users);
    const result = await userRepo.createQueryBuilder("users")
      .where("users.id = :id", { id: userId })
      .leftJoinAndSelect("users.shops", "shops")
      .select([
        "shops.id", "shops.name", "shops.introduction",
        "shops.location", "shops.logoUrl", "users.id",
        "users.username", "users.followersCount", "users.followingsCount",
        "users.avatarUrl", "users.introduction"
      ])
      .getOne();
    
    if (!result) {
      throw new ResourceNotFoundError("User not found.");
    }
    res.send({
      data: result
    });

  }

}