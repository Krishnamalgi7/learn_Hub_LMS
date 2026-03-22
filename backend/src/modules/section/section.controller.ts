import type { NextFunction, Request, Response } from "express";
import { getSections, getSection } from "./section.service";

export const listSectionsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subjectId = Number(req.params.subjectId);
    const sections = await getSections(subjectId);
    res.json({ sections });
  } catch (err) {
    next(err);
  }
};

export const getSectionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const section = await getSection(id);
    res.json({ section });
  } catch (err) {
    next(err);
  }
};

