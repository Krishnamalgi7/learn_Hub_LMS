import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../../middleware/error.middleware";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { getVideoForUser } from "./video.service";

export const getVideoHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!userId) {
      throw new HttpError(401, "Unauthorized");
    }

    const videoId = Number(req.params.id);
    if (!Number.isFinite(videoId)) {
      throw new HttpError(400, "Invalid video id");
    }

    const payload = await getVideoForUser(videoId, userId);
    res.json({ video: payload.video, next_video_id: payload.next_video_id, previous_video_id: payload.previous_video_id, last_position_seconds: payload.last_position_seconds, is_completed: payload.is_completed, is_locked: payload.is_locked });
  } catch (err) {
    next(err);
  }
};

