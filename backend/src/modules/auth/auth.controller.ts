import type { Request, Response, NextFunction } from "express";
import { signup, login, logout, refreshTokens } from "./auth.service";
import { HttpError } from "../../middleware/error.middleware";
import { env } from "../../config/env";

/** Cross-origin frontends (e.g. Vercel → Render) need Secure + SameSite=None. Local dev uses Lax. */
const refreshCookieOptions = (): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax" | "none";
  maxAge: number;
  path: string;
  domain?: string;
} => {
  const secure = env.cookies.secure;
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
    ...(env.cookies.domain ? { domain: env.cookies.domain } : {}),
  };
};

const setAuthCookies = (res: Response, refreshToken: string) => {
  res.cookie("refresh_token", refreshToken, refreshCookieOptions());
};

export const signupHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      throw new HttpError(400, "Name, email, password, and role are required");
    }
    const user = await signup(name, email, password, role);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpError(400, "Email and password are required");
    }
    const { user, accessToken, refreshToken } = await login(email, password);
    setAuthCookies(res, refreshToken);
    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

export const logoutHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refresh_token as string | undefined;
    if (token) {
      await logout(token);
    }
    
    const { maxAge, ...cookieOptions } = refreshCookieOptions();
    res.clearCookie("refresh_token", cookieOptions);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const refreshHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenFromCookie = req.cookies?.refresh_token as string | undefined;
    const tokenFromBody = req.body?.refreshToken as string | undefined;
    const token = tokenFromCookie ?? tokenFromBody;
    if (!token) {
      throw new HttpError(401, "Missing refresh token");
    }
    const { accessToken, refreshToken } = await refreshTokens(token);
    setAuthCookies(res, refreshToken);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

