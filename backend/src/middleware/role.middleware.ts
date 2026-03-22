import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth.middleware";

export const requireInstructor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "instructor") {
    return res.status(403).json({ message: "Instructor access only" });
  }
  return next();
};

