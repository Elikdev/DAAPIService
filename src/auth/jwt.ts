import jwt, { DecodeOptions, SignOptions } from "jsonwebtoken";

import fs from "fs";
import path from "path";

const getAppPath = () => {
  if (require.main) {
    return path.dirname(require.main.filename);
  }
};

const privateKEY = fs.readFileSync(getAppPath() + "/../private.key", "utf8");
const publicKEY = fs.readFileSync(getAppPath() + "/../public.key", "utf8");

export class JwtHelper {
  static sign(payload: any): string {
    // Token signing options
    const signOptions: SignOptions = {
      expiresIn: "30d", // 30 days validity
      algorithm: "RS256",
    };
    return jwt.sign(payload, privateKEY, signOptions);
  }

  static verify(token: string): any | string {
    return jwt.verify(token, publicKEY);
  }

  static decode(token: string): null | { [key: string]: any } | string {
    const decodeOptions: DecodeOptions = {
      complete: true,
    };
    return jwt.decode(token, decodeOptions);
  }
}
