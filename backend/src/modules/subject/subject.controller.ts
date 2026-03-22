import type { Request, Response, NextFunction } from "express";
import { getAllSubjects, getSubject, getSubjectFull, getSubjectTree } from "./subject.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { HttpError } from "../../middleware/error.middleware";

export const listSubjectsHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const subjects = await getAllSubjects();
    res.json({ subjects });
  } catch (err) {
    next(err);
  }
};

export const getSubjectHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const subject = await getSubject(id);
    res.json({ subject });
  } catch (err) {
    next(err);
  }
};

export const getSubjectTreeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const tree = await getSubjectTree(id);
    res.json({ tree });
  } catch (err) {
    next(err);
  }
};

export const getSubjectFullHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!userId) throw new HttpError(401, "Unauthorized");

    const id = Number(req.params.id);
    const full = await getSubjectFull(id, userId);
    res.json(full);
  } catch (err) {
    next(err);
  }
};

