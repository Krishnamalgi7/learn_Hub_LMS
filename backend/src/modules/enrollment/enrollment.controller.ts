import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../../middleware/error.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { enrollInSubject, getEnrollments } from "./enrollment.service";

export const enrollHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!userId) throw new HttpError(401, "Unauthorized");

    const subjectId_raw = req.body?.subject_id ?? req.body?.subjectId;
    const subjectId = typeof subjectId_raw === "number" ? subjectId_raw : Number(subjectId_raw);
    if (!Number.isFinite(subjectId)) {
      throw new HttpError(400, "Missing or invalid subject_id");
    }

    const enrollment = await enrollInSubject(userId, subjectId);
    res.status(201).json({ enrollment });
  } catch (err) {
    next(err);
  }
};

export const listEnrollmentsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const authUserId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!authUserId) throw new HttpError(401, "Unauthorized");

    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) {
      throw new HttpError(400, "Invalid userId");
    }

    if (userId !== authUserId) {
      throw new HttpError(403, "Forbidden");
    }

    const enrollments = await getEnrollments(userId);
    res.json({ enrollments });
  } catch (err) {
    next(err);
  }
};

