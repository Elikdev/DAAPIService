import crypto from "crypto";
import { logger } from "../logging/logger";

const NOUNCE_STR_LENGTH = 12;
const NOUNCE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export class WxpayUtility {

  static encodeValue(value:string, encode:string): string {
    return crypto.createHash(encode).update(value).digest("hex");
  }

  // for payment confirmation
  static isValidSignature(data:any, signature:string, apiToken:string): boolean {
    return this.generateSignature(data, apiToken) === signature;
  }

  static generateSignature(data: any, apiToken="", encode = "md5"): string {
    let serializedData = this.reorderAndSerializedObject(data);

    // concat API token at the end
    if (apiToken) {
      serializedData += `&key=${apiToken}`;
    }
    // logger.debug("\n" +
    //   "<--------------serializedData-------------->" + "\n"
    //   + JSON.stringify(serializedData) + "\n"
    //   + "<--------------serializedData-------------->" + "\n"
    // );
    const encoded = this.encodeValue(serializedData, encode).toUpperCase();

    return encoded;
  }

  static reorderAndSerializedObject(obj: any): string {
    let serialized = "";

    Object.keys(obj).sort().forEach(key => {
      if (serialized !== "") {
        serialized += "&";
      }
      serialized += key + "=" + obj[key];
    });

    return serialized;
  }

  static generateNonceStr(length = NOUNCE_STR_LENGTH): string {
    let result = "";
    const charactersLength = NOUNCE_CHARS.length;
    for ( let i = 0; i < length; i++ ) {
      result += NOUNCE_CHARS.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
