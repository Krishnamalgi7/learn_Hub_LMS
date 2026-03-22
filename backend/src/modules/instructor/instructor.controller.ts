import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { HttpError } from "../../middleware/error.middleware";
import {
  createInstructorCourse,
  createInstructorSection,
  createInstructorVideo,
  updateInstructorCourse,
  deleteInstructorCourse,
  updateInstructorSection,
  deleteInstructorSection,
  updateInstructorVideo,
  deleteInstructorVideo,
  getInstructorCourses,
} from "./instructor.service";

export const createCourseHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const instructorId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!instructorId) throw new HttpError(401, "Unauthorized");

    const { title, description, price, is_paid } = req.body ?? {};
    if (typeof price !== "number" && typeof price !== "string") {
      throw new HttpError(400, "price is required");
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice)) throw new HttpError(400, "Invalid price");

    const isPaid =
      typeof is_paid === "boolean" ? is_paid : is_paid === 1 || is_paid === "1" || is_paid === "true";

    const subjectId = await createInstructorCourse(instructorId, {
      title: String(title ?? ""),
      description: String(description ?? ""),
      price: parsedPrice,
      isPaid,
    });

    res.status(201).json({ subjectId });
  } catch (err) {
    next(err);
  }
};

export const createSectionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const instructorId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!instructorId) throw new HttpError(401, "Unauthorized");

    const { subject_id, title, order_index } = req.body ?? {};
    const subjectId = Number(subject_id ?? subject_id);
    const parsedOrderIndex = order_index == null ? 0 : Number(order_index);

    if (!Number.isFinite(subjectId) || subjectId <= 0) throw new HttpError(400, "subject_id is required");
    if (!title) throw new HttpError(400, "title is required");
    if (!Number.isFinite(parsedOrderIndex)) throw new HttpError(400, "Invalid order_index");

    const sectionId = await createInstructorSection(instructorId, {
      subjectId,
      title: String(title),
      orderIndex: parsedOrderIndex,
    });

    res.status(201).json({ sectionId });
  } catch (err) {
    next(err);
  }
};

export const createVideoHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const instructorId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!instructorId) throw new HttpError(401, "Unauthorized");

    const { section_id, title, youtube_id, order_index } = req.body ?? {};
    const sectionId = Number(section_id);
    const parsedOrderIndex = order_index == null ? 0 : Number(order_index);

    if (!Number.isFinite(sectionId) || sectionId <= 0) throw new HttpError(400, "section_id is required");
    if (!title) throw new HttpError(400, "title is required");
    if (!youtube_id) throw new HttpError(400, "youtube_id is required");
    if (!Number.isFinite(parsedOrderIndex)) throw new HttpError(400, "Invalid order_index");

    const videoId = await createInstructorVideo(instructorId, {
      sectionId,
      title: String(title),
      youtubeId: String(youtube_id),
      orderIndex: parsedOrderIndex,
      durationSeconds: 0,
    });

    res.status(201).json({ videoId });
  } catch (err) {
    next(err);
  }
};

export const listInstructorCoursesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const instructorId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!instructorId) throw new HttpError(401, "Unauthorized");

    const courses = await getInstructorCourses(instructorId);
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

export const updateCourseHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const instructorId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!instructorId) throw new HttpError(401, "Unauthorized");

    const courseId = Number(req.params.id);
    if (!Number.isFinite(courseId) || courseId <= 0) throw new HttpError(400, "Invalid course id");

    const { title, description, price, is_paid } = req.body ?? {};
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice)) throw new HttpError(400, "Invalid price");
    const isPaid = typeof is_paid === "boolean" ? is_paid : is_paid === 1 || is_paid === "1" || is_paid === "true";

    await updateInstructorCourse(instructorId, {
      courseId,
      title: String(title ?? ""),
      description: String(description ?? ""),
      price: parsedPrice,
      isPaid,
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const deleteCourseHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const instructorId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!instructorId) throw new HttpError(401, "Unauthorized");
    const courseId = Number(req.params.id);
    if (!Number.isFinite(courseId) || courseId <= 0) throw new HttpError(400, "Invalid course id");
    await deleteInstructorCourse(instructorId, courseId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const updateSectionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const instructorId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!instructorId) throw new HttpError(401, "Unauthorized");
    const sectionId = Number(req.params.id);
    if (!Number.isFinite(sectionId) || sectionId <= 0) throw new HttpError(400, "Invalid section id");

    const { title, order_index } = req.body ?? {};
    const parsedOrderIndex = Number(order_index ?? 0);
    if (!Number.isFinite(parsedOrderIndex)) throw new HttpError(400, "Invalid order_index");

    await updateInstructorSection(instructorId, {
      sectionId,
      title: String(title ?? ""),
      orderIndex: parsedOrderIndex,
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const deleteSectionHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const instructorId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!instructorId) throw new HttpError(401, "Unauthorized");
    const sectionId = Number(req.params.id);
    if (!Number.isFinite(sectionId) || sectionId <= 0) throw new HttpError(400, "Invalid section id");
    await deleteInstructorSection(instructorId, sectionId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const updateVideoHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const instructorId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!instructorId) throw new HttpError(401, "Unauthorized");
    const videoId = Number(req.params.id);
    if (!Number.isFinite(videoId) || videoId <= 0) throw new HttpError(400, "Invalid video id");

    const { title, youtube_id, order_index } = req.body ?? {};
    const parsedOrderIndex = Number(order_index ?? 0);
    if (!Number.isFinite(parsedOrderIndex)) throw new HttpError(400, "Invalid order_index");

    await updateInstructorVideo(instructorId, {
      videoId,
      title: String(title ?? ""),
      youtubeId: String(youtube_id ?? ""),
      orderIndex: parsedOrderIndex,
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const deleteVideoHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    const instructorId = authReq.userId ? Number(authReq.userId) : undefined;
    if (!instructorId) throw new HttpError(401, "Unauthorized");
    const videoId = Number(req.params.id);
    if (!Number.isFinite(videoId) || videoId <= 0) throw new HttpError(400, "Invalid video id");
    await deleteInstructorVideo(instructorId, videoId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

