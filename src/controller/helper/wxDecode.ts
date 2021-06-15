// 引入crypto-js
import CryptoJS from "crypto-js";
import {Base64} from "js-base64";
import { logger } from "../../logging/logger";

export class Decode {
  sessionKey: string
 
  constructor(sessionKey: string ) {
    this.sessionKey = sessionKey;
  }
 
  decryptData(data: string, ivv: string):any {
    try {
      const key = CryptoJS.enc.Base64.parse(this.sessionKey);
      const iv = CryptoJS.enc.Base64.parse(ivv);
      const decrypt = CryptoJS.AES.decrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      logger.info("Decrypting user data with iv:" + ivv);

      const decryptedData =  Base64.decode(CryptoJS.enc.Base64.stringify(decrypt));
      
      logger.info("Decryped data:" + decryptedData);

      return JSON.parse(decryptedData);
    }catch(error) {

      console.log(error);
    }
  }
}
 
 