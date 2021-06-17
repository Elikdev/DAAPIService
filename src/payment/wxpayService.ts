
import { PaymentConstants } from "./constants";
import { ServiceCall } from "../service/serviceCall";
import { Response } from "node-fetch";
import { WxpayUtility } from "./wxpayUtility";
import { j2xParser, parse } from "fast-xml-parser";
import { logger } from "../logging/logger";
import { DependencyError } from "../error/dependencyError";

const APP_ID = "wxf3dcefa8d5e1abd3";

interface PaymentRequestData {
  [key: string]: string | number
}

export class WxpayService { 

  payUrl: string
  merchantId: string
  storeId: string
  apiToken: string
  callbackUrl: string
  ip: string
  useSandbox: boolean

  constructor(useSandbox: boolean) {
    this.useSandbox = useSandbox;
    let constants = PaymentConstants.prod;
    this.apiToken = constants.API_TOKEN;
    if (useSandbox) {
      constants = PaymentConstants.test;
    }
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

  async prepay(amount:number, openId:string, orderId:string, useProfitSharing:boolean): Promise<any> {
    const headers = {
      "Content-Type": "application/xml",
    };
    if (this.useSandbox) {
      this.apiToken = await WxpayService.getSandboxSignedKey();
      if (!this.apiToken) {
        throw new DependencyError("Failed to get sandbox sign key.");
      }
    }
    const data: PaymentRequestData = {};
    data.appId = APP_ID;
    data.mch_id = this.merchantId;
    const nonce_str = WxpayUtility.generateNonceStr();
    data.nonce_str = nonce_str;
    data.out_trade_no = orderId;
    data.total_fee = amount * 100;
    data.spbill_create_ip = this.ip;
    data.notify_url = this.callbackUrl;
    data.trade_type = "JSAPI";
    data.profit_sharing = useProfitSharing ? "Y": "N";
    data.openid = openId;
    
    const signature = WxpayUtility.generateSignature(data, this.apiToken);
    data.sign = signature;

    const xmlBody = {
      xml: data
    };

    const parser = new j2xParser({});
    const xmlData = parser.parse(xmlBody);

    return ServiceCall.post(this.payUrl, xmlData, headers)
      .then((response:Response) => response.text())
      .then((text) => {
        const res = parse(text);
        logger.debug("pay result:" + JSON.stringify(res));
        return res;
      });
  }

  static getSandboxSignedKey(): Promise<any> {
    const headers = {
      "Content-Type": "application/xml",
    };
    
    const url = PaymentConstants.test.SB_KEY_URL;
    const nonceStr = WxpayUtility.generateNonceStr();
    const data: PaymentRequestData = {};
    data.mch_id = PaymentConstants.test.MERCHANT_ID;
    data.nonce_str = nonceStr;

    const signature = WxpayUtility.generateSignature(data, PaymentConstants.test.API_TOKEN);
    data.sign = signature;

    const xmlBody = {
      xml: data
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
}

