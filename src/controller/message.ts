import axios from "axios";
import qs from "qs";
import { Request, Response, NextFunction } from "express";
import { HandleError } from "../decorator/errorDecorator";
import { logger } from "../logging/logger";

export class MessageController {
  @HandleError("sendSubscriptionMessage")
  static async sendSubscriptionMessage(req: Request, res: Response): Promise<void> {
    const messageData = req.body.data;
    logger.debug(req.body);

    const data = {
      touser: messageData.openid,
      template_id: 'CM9TwYeMFeWS_vwvEoGI3adgVG3rayAy3G_BYDXeWK8',
      data: {
        thing1:{
          value: messageData.scene
        },
        thing5:{
          value: messageData.nick_name
        },
        thing7:{
          value: messageData.content
        }
      }
    }

    const params =  {
      appid: process.env.WX_APP_ID,
      secret: process.env.WX_APP_SECRET,
      grant_type: "client_credential"
    };
    const queryString = qs.stringify(params);
    const wxurl = `https://api.weixin.qq.com/cgi-bin/token?${queryString}`;

    const accessTokenData = await axios.get(wxurl);
    const accessToken = accessTokenData.data.access_token;

    const result = await axios.post(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`, data);

    res.send({
      data: result.data
    });
  }
}