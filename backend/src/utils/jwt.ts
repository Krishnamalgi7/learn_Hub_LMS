import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayloadBase {
  sub: string;
}

export const signAccessToken = (payload: JwtPayloadBase) =>
  jwt.sign(payload, env.jwt.accessSecret as any, {
    expiresIn: env.jwt.accessExpiresIn as any,
  });

export const signRefreshToken = (payload: JwtPayloadBase) =>
  jwt.sign(payload, env.jwt.refreshSecret as any, {
    expiresIn: env.jwt.refreshExpiresIn as any,
  });

export const verifyAccessToken = (token: string): JwtPayloadBase =>
  jwt.verify(token, env.jwt.accessSecret) as JwtPayloadBase;

export const verifyRefreshToken = (token: string): JwtPayloadBase =>
  jwt.verify(token, env.jwt.refreshSecret) as JwtPayloadBase;

