import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, env.bcryptSaltRounds);
}

export function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
