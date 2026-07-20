import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AccessTokenPayload } from "../modules/auth/auth.types.js";

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
}
