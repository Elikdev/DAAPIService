import jwt, { DecodeOptions, SignOptions } from "jsonwebtoken";
import axios from "axios";
import fs from "fs";
import path from "path";

const getAppPath = () => {
  if (require.main) {
    return path.dirname(require.main.filename);
  }
};
const privateKEY = fs.readFileSync(getAppPath() + "/../private.key", "utf8");
const publicKEY = fs.readFileSync(getAppPath() + "/../public.key", "utf8");

const APPLE_BASE_URL = "https://appleid.apple.com";
const jwksClient = require("jwks-rsa");
const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
});

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

export const getApplePublicKey = async (kid: any) => {
  const key: any = await new Promise((resolve, reject) => {
    client.getSigningKey(kid, (error: any, result: any) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
  });
  return key.publicKey || key.rsaPublicKey;
};

export const verifyAppleToken = async (token: any) => {
  const decoded: any = jwt.decode(token, { complete: true });
  const { kid, alg } = decoded.header;
  const applePublicKey = await getApplePublicKey(kid);

  const jwtClaims: any = await jwt.verify(token, applePublicKey, {
    algorithms: ["RS256"],
    issuer: "https://appleid.apple.com",
    audience: "com.retopia.vintage",
  });
  if (!jwtClaims.iss || jwtClaims.iss !== APPLE_BASE_URL) {
    throw new Error(
      `The iss does not match the Apple URL - iss: ${jwtClaims.iss} | expected: ${APPLE_BASE_URL}`,
    );
  }

  if (jwtClaims.aud === "com.retopia.vintage") {
    return jwtClaims;
  }

  throw new Error(
    `The aud parameter does not include this client - is: ${jwtClaims.aud} | expected: com.retopia.vintage`,
  );
};
