import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { HttpError } from "./error.middleware";
import { findUserById } from "../modules/auth/auth.repository";

export type AuthUser = {
  id: string;
  role: "learner" | "instructor";
};

export interface AuthRequest extends Request {
  userId?: string;
  user?: AuthUser;
}

export const authMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring("Bearer ".length) : undefined;

  if (!token) {
    return next(new HttpError(401, "Missing access token"));
  }

  try {
    const payload = verifyAccessToken(token);
    const userId = payload.sub;
    req.userId = userId;

    const userIdNumber = Number(userId);
    if (!Number.isFinite(userIdNumber)) {
      return next(new HttpError(401, "Invalid access token payload"));
    }

    findUserById(userIdNumber)
      .then((user) => {
        if (!user) {
          return next(new HttpError(401, "User not found"));
        }
        req.user = { id: String(user.id), role: user.role };
        return next();
      })
      .catch((error) => next(error));
    return;
  } catch {
    return next(new HttpError(401, "Invalid or expired access token"));
  }
};

