const axios = require("axios").default;
import crypto from "crypto";

import { WxpayUtility } from "../../payment/wxpayUtility";

export const getToken = async () => {
  const tokenUrl =
    "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxe762fdfc8f4b89eb&secret=fddb762baa369cf7a9c303e13387e623";

  const response = await axios.get(tokenUrl);

  const url = "http://www.event.pbrick.cn/";
  const noncestr = WxpayUtility.generateNonceStr();
  const timestamp = Math.floor(Date.now() / 1000); //精确到秒

  if (response.status == 200) {
    const tokenMap = response.data;
    return axios
      .get(
        "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" +
          tokenMap.access_token +
          "&type=jsapi",
      )
      .then(function (response: any) {
        if (response.status == 200) {
          const ticketMap = response.data;
          const obj = {
            noncestr: noncestr,
            timestamp: timestamp,
            url: url,
            jsapi_ticket: ticketMap.ticket,
            signature: crypto
              .createHash("sha1")
              .update(
                "jsapi_ticket=" +
                  ticketMap.ticket +
                  "&noncestr=" +
                  noncestr +
                  "&timestamp=" +
                  timestamp +
                  "&url=" +
                  url,
              )
              .digest("hex"),
          };
          return obj;
        }
      });
  }
};
