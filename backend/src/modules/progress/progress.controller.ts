import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../../middleware/error.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { getSubjectProgress, upsertVideoProgressForUser } from "./progress.service";

export const getSubjectProgressHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!userId) throw new HttpError(401, "Unauthorized");

    const subjectId = Number(req.params.subjectId);
    if (!Number.isFinite(subjectId)) throw new HttpError(400, "Invalid subjectId");

    const payload = await getSubjectProgress(userId, subjectId);
    res.json({ progress: payload });
  } catch (err) {
    next(err);
  }
};

export const postVideoProgressHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!userId) throw new HttpError(401, "Unauthorized");

    const videoId = Number(req.params.videoId);
    if (!Number.isFinite(videoId)) throw new HttpError(400, "Invalid videoId");

    const last_position_seconds_raw = req.body?.last_position_seconds;
    const is_completed_raw = req.body?.is_completed;

    const last_position_seconds =
      typeof last_position_seconds_raw === "number"
        ? last_position_seconds_raw
        : typeof last_position_seconds_raw === "string"
          ? Number(last_position_seconds_raw)
          : NaN;

    let is_completed: boolean;
    if (typeof is_completed_raw === "boolean") {
      is_completed = is_completed_raw;
    } else if (typeof is_completed_raw === "number") {
      is_completed = is_completed_raw === 1;
    } else if (typeof is_completed_raw === "string") {
      is_completed = is_completed_raw === "true" || is_completed_raw === "1";
    } else {
      throw new HttpError(400, "Missing or invalid is_completed");
    }

    const progressRow = await upsertVideoProgressForUser(
      userId,
      videoId,
      last_position_seconds,
      is_completed,
    );

    res.json({
      progress: {
        video_id: progressRow.video_id,
        last_position_seconds: progressRow.last_position_seconds,
        is_completed: progressRow.is_completed === 1,
        completed_at: progressRow.completed_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

