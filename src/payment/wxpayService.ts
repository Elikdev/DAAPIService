import { PaymentConstants } from "./constants";
import { ServiceCall } from "../service/serviceCall";
import { Response } from "node-fetch";
import { WxpayUtility } from "./wxpayUtility";
import { j2xParser, parse } from "fast-xml-parser";
import { logger } from "../logging/logger";
import { DependencyError } from "../error/dependencyError";
import { Users } from "../entities/Users";
import { ResourceNotFoundError } from "../error/notfoundError";
import { Platform } from "../entities/Payments";

interface PaymentRequestData {
  [key: string]: string | number;
}

interface PayResult {
  [key: string]: string | number;
}

export class WxpayService {
  payUrl: string;
  merchantId: string;
  storeId: string;
  apiToken: string;
  callbackUrl: string;
  ip: string;
  useSandbox: boolean;

  constructor() {
    const APP_ENV = process.env.APP_ENV;
    let constants;
    this.useSandbox = false;
    switch (APP_ENV) {
      case "development":
        constants = PaymentConstants.sandbox;
        this.useSandbox = true;
        break;
      case "test":
        constants = PaymentConstants.test;
        break;
      case "production":
        constants = PaymentConstants.prod;
        break;
      default:
        constants = PaymentConstants.sandbox;
        this.useSandbox = true;
        break;
    }
    this.apiToken = constants.API_TOKEN;
    this.payUrl = constants.PAY_URL;
    this.merchantId = constants.MERCHANT_ID;
    this.storeId = constants.STORE_ID;
    this.callbackUrl = constants.CALL_BACK_URL;
    this.ip = constants.IP;
  }

  /**
   * @param {*} amount x 100 = total_fee 订单总金额，传入单位为元，传出单位为分
   * https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=4_2
   * @param {*} openId trade_type=JSAPI，此参数必传，用户在商户appid下的唯一标识。openid如何获取，可参考
   * https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
   * @param {*} orderId out_trade_no 商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*且在同一个商户号下唯一
   * https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=4_2
   *
   * 统一下单文档： https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=9_1
   */

  async prepay(
    amount: number,
    openId: string,
    orderId: string,
    useProfitSharing: boolean,
    platform: string,
  ): Promise<any> {
    const headers = {
      "Content-Type": "application/xml",
    };
    if (this.useSandbox) {
      this.apiToken = await WxpayService.getSandboxSignedKey();
      if (!this.apiToken) {
        throw new DependencyError("Failed to get sandbox sign key.");
      }
    }
    let appId = PaymentConstants.APP_APP_ID;
    let tradeType = "APP";
    const data: PaymentRequestData = {};
    if (platform == Platform.MINIPROGRAM) {
      if (!openId) {
        throw new ResourceNotFoundError("openid for user not found");
      }
      data.openid = openId;
      appId = PaymentConstants.MINIPROGRAM_APP_ID;
      tradeType = "JSAPI";
    }
    data.appid = appId;
    data.mch_id = this.merchantId;
    const nonce_str = WxpayUtility.generateNonceStr();
    data.nonce_str = nonce_str;
    data.out_trade_no = orderId;
    data.total_fee = amount * 100;
    data.spbill_create_ip = this.ip;
    data.notify_url = this.callbackUrl;
    data.trade_type = tradeType;
    data.profit_sharing = useProfitSharing ? "Y" : "N";
    data.body = "NEED! 商品订单";

    const signature = WxpayUtility.generateSignature(data, this.apiToken);
    data.sign = signature;

    const xmlBody = {
      xml: data,
    };

    const parser = new j2xParser({});
    const xmlData = parser.parse(xmlBody);

    return ServiceCall.post(this.payUrl, xmlData, headers)
      .then((response: Response) => response.text())
      .then((text) => {
        const res = parse(text);
        logger.debug("pay result:" + JSON.stringify(res));
        return res;
      });
  }

  /**
   * Fetch sandbox key for testing purpose
   * https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=23_1
   */
  static getSandboxSignedKey(): Promise<string> {
    const headers = {
      "Content-Type": "application/xml",
    };

    const url = PaymentConstants.sandbox.SB_KEY_URL;
    const nonceStr = WxpayUtility.generateNonceStr();
    const data: PaymentRequestData = {};
    data.mch_id = PaymentConstants.sandbox.MERCHANT_ID;
    data.nonce_str = nonceStr;

    const signature = WxpayUtility.generateSignature(
      data,
      PaymentConstants.test.API_TOKEN,
    );
    data.sign = signature;

    const xmlBody = {
      xml: data,
    };

    const parser = new j2xParser({});
    const xmlData = parser.parse(xmlBody);

    return ServiceCall.post(url, xmlData, headers)
      .then((response) => response.text())
      .then((text) => {
        logger.debug(JSON.stringify(parse(text)));
        return parse(text).xml.sandbox_signkey;
      });
  }

  payOrder = async (
    userId: any,
    paymentId: string,
    totalPrice: number,
    platform: string,
  ): Promise<any> => {
    const user = await Users.findOne({ id: userId });
    if (!user) {
      throw new ResourceNotFoundError("user in order not found");
    }
    const openId = user.openId;
    // TODO: 分账
    const payresult = await this.prepay(
      totalPrice,
      openId,
      paymentId,
      false,
      platform,
    );
    if (payresult.xml.return_code != "SUCCESS") {
      throw new DependencyError("Encounter error calling wx prepay api");
    }
    return payresult.xml;
  };

  /**
   * Generate payment response for front end
   * @param prepayResponse wx prepay response
   * https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=7_7&index=5
   */
  generatePayResult = (prepayResponse: any, platform: string): PayResult => {
    const payResult: PayResult = {};

    if (platform === Platform.MINIPROGRAM) {
      payResult.appId = PaymentConstants.MINIPROGRAM_APP_ID;
      payResult.timeStamp = Math.floor(Date.now() / 1000).toString();
      payResult.nonceStr = prepayResponse.nonce_str;
      payResult.package = `prepay_id=${prepayResponse.prepay_id}`;
      payResult.signType = "MD5";
    } else {
      payResult.appid = PaymentConstants.APP_APP_ID;
      payResult.timestamp = Math.floor(Date.now() / 1000).toString();
      payResult.noncestr = prepayResponse.nonce_str;
      payResult.prepayid = prepayResponse.prepay_id;
      payResult.partnerid = "1610299103";
      payResult.package = "Sign=WXPay";
    }

    const sign = WxpayUtility.generateSignature(
      payResult,
      PaymentConstants.prod.API_TOKEN,
    );
    payResult.paySign = sign;
    return payResult;
  };
}
