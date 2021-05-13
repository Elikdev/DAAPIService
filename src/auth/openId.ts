import axios from "axios";
import qs from "qs";
import { DependencyError } from "../error/dependencyError";
import { logger } from "../logging/logger";

export const getOpenId = async (wxCode: string): Promise<void> => {
  const params =  {
    appid: process.env.WX_APP_ID,
    secret: process.env.WX_APP_SECRET,
    js_code: wxCode,
    grant_type: "authorization_code"
  };
  const queryString = qs.stringify(params);
  const wxurl = `https://api.weixin.qq.com/sns/jscode2session?${queryString}`;

  const response = await axios.post(wxurl);
  const openId = response.data.openid;

  if (!openId) {
    logger.error("Got error: " + JSON.stringify(response.data));
    throw new DependencyError("Failure retrieving openId from weixin.");
  }

  return openId;
};