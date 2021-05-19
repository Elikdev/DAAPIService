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
import { signUpSchema } from "../validator/schemas";
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
    const userId = req.body.userId;
    const encryptedDataDecoder = new Decode(sessionData.session_key);
    const userRepo = getRepository(Users);
    const openId = sessionData.openid;
    const userInfo = encryptedDataDecoder.decryptData(encryptedData, iv);
    let user = await userRepo.findOne({where: {openId: openId}});

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
    const returnData = {};

    if(user.role == Constants.SHOPPER) {
      res.send({
        loginToken: accessToken,
        userInfo: user,
        items: {
          count: 0,
          data: [],
          paginations: {}
        },
        shopMetaData: { //TODO fetch from db.
          shopName: "",
          location:  "",
          description: ""
        }
      });
    } else {
      res.send({
        loginToken: accessToken,
        userInfo: user,
        items: { //TODO fetch from db.
          count: 0,
          data: [ 
            [
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995"},
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
            ],
            [
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" }
            ],
            [
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" }
            ],
            [
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" }
            ],
            [
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" }
            ],
            [
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" }
            ],
            [
              { id: "", image: "https://7061-pandabrickapp-gnsk7-1302575607.tcb.qcloud.la/1-2%402x.png?sign=3d82e2f6f704410f7a60d981ed207cd5&t=1595188995" },
            ]
          ],
          paginations: {}
        }, 
        shopMetaData: { 
          shopName: "DandyHobo Vintage",
          location:  "上海 xxxxxxx ",
          description: "xxxx xxxx"
        }
      });   
    }



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