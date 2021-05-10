
import jwt, { DecodeOptions, SignOptions } from "jsonwebtoken";

// import fs from "fs";
// import path from "path";
// const appDir = path.dirname(require.main.filename);
// use 'utf8' to get string instead of byte array  (512 bit key)
// let privateKEY = fs.readFileSync(appDir + "/private.key", "utf8");
// let publicKEY = fs.readFileSync(appDir + "/public.key", "utf8");

export class JwtHelper {

  static sign(payload: string): string {
    // Token signing options
    const signOptions:SignOptions = {
      expiresIn: "30d", // 30 days validity
      algorithm: "RS256"
    };
    return jwt.sign(payload, "", signOptions);
  }

  static verify(token: string): any | string {
    return jwt.verify(token, "");
  }
  
  static decode(token: string): null | { [key: string]: any } | string {
    const decodeOptions:DecodeOptions = {
      complete: true
    };
    return jwt.decode(token, decodeOptions);
  }
}
