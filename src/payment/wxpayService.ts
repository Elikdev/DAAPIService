
import { PaymentConstants } from "./constants";
import { ServiceCall } from "../service/serviceCall";
import { Response } from "node-fetch";
import { WxpayUtility } from "./wxpayUtility";

const SERVICE_URL = process.env.SERVICE_URL;
const CALL_BACK_URL = SERVICE_URL + "/v1/orders/confirmpayment";

const VENDOR_NAME = "wechatpay";
const MINI_PROGRAM_TERMINAL = "MINIPROGRAM";
const CURRENCY_TYPE = "USD";

export class WxpayService { 

  baseUrl: string
  merchantId: string
  storeId: string
  apiToken: string

  constructor(useSandbox: boolean) {
    let constants = PaymentConstants.prod;
    if (useSandbox) {
      constants = PaymentConstants.test;
    }
    this.baseUrl = constants.BASE_URL;
    this.merchantId = constants.MERCHANT_ID;
    this.storeId = constants.STORE_ID;
    this.apiToken = constants.API_TOKEN;
  }

  /**
   * 
   * @param {*} amount 
   * @param {*} openId 
   * @param {*} orderId 
   * 
   * example response from prepay api: 
   * {
   *   "ret_msg": "prepay success",
   *   "ret_code": "000100",
   *   "result": {
   *       "timeStamp": "1510341967363",
   *       "nonceStr": "a611bda03d544b9f941393c48c2e517f",
   *       "package": "prepay_id=wx201711110326070ccf2a7f060678638664",
   *       "signType": "MD5",
   *       "paySign": "09E5BE5B9D93080E3B7DD05C8F41049E"
   *     }
   * }
   */

  prepay(amount:string, openId:string, orderId:string):any {
    const headers = {
      "Content-Type": "application/json",
    };

    const prepayUrl = this.baseUrl + "/micropay";

    const data = {
      merchantNo: this.merchantId,
      storeNo: this.storeId,
      rmbAmount: amount,
      currency: CURRENCY_TYPE,
      vendor: VENDOR_NAME,
      ipnUrl: CALL_BACK_URL,
      openid: openId,
      reference: orderId,
      terminal: MINI_PROGRAM_TERMINAL,
      description: "熊猫砖订单付款",
      verifySign: ""
    };

    const signature = WxpayUtility.generateSignature(data, this.apiToken);
    
    data.verifySign = signature;

    return ServiceCall.post(prepayUrl, data , headers)
      .then((response:Response) => response.json());
  }
}

