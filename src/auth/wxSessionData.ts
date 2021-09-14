import axios from "axios";
import qs from "qs";
import { DependencyError } from "../error/dependencyError";

export const getSessionData = async (wxCode: string): Promise<any> => {
  const params = {
    appid: process.env.WX_APP_ID,
    secret: process.env.WX_APP_SECRET,
    js_code: wxCode,
    grant_type: "authorization_code",
  };
  const queryString = qs.stringify(params);
  const wxurl = `https://api.weixin.qq.com/sns/jscode2session?${queryString}`;

  const response = await axios.post(wxurl);
  const sessionData = response.data;

  if (!sessionData) {
    throw new DependencyError("Failure retrieving openId from weixin.");
  }

  return sessionData;
};

export const getUserInfo = async (wxCode: string): Promise<any> => {
  const params = {
    appid: process.env.WX_APP_APP_ID,
    secret: process.env.WX_APP_APP_SECRET,
    code: wxCode,
    grant_type: "authorization_code",
  };
  const queryString = qs.stringify(params);
  const wxurl = `https://api.weixin.qq.com/sns/oauth2/access_token?${queryString}`;

  return await axios
    .post(wxurl)
    .then(async function (res) {
      const userParams = {
        access_token: res.data.access_token,
        openid: res.data.openid,
        lang: "zh_CN",
      };
      const userInfoQueryString = qs.stringify(userParams);
      const uerinfoUrl = `https://api.weixin.qq.com/sns/userinfo?${userInfoQueryString}`;
      const userInfoResponse = await axios.get(uerinfoUrl).then(function (res) {
        return res.data;
      });
      return userInfoResponse;
    })
    .catch(function (err) {
      console.error(err);
    });
};
