import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireInstructor } from "../../middleware/role.middleware";
import {
  createCourseHandler,
  createSectionHandler,
  createVideoHandler,
  deleteCourseHandler,
  deleteSectionHandler,
  deleteVideoHandler,
  listInstructorCoursesHandler,
  updateCourseHandler,
  updateSectionHandler,
  updateVideoHandler,
} from "./instructor.controller";

const router = Router();

router.get("/instructor/courses", authMiddleware, requireInstructor, listInstructorCoursesHandler);
router.post("/instructor/courses", authMiddleware, requireInstructor, createCourseHandler);
router.put("/instructor/courses/:id", authMiddleware, requireInstructor, updateCourseHandler);
router.delete("/instructor/courses/:id", authMiddleware, requireInstructor, deleteCourseHandler);

router.post("/instructor/sections", authMiddleware, requireInstructor, createSectionHandler);
router.put("/instructor/sections/:id", authMiddleware, requireInstructor, updateSectionHandler);
router.delete("/instructor/sections/:id", authMiddleware, requireInstructor, deleteSectionHandler);

router.post("/instructor/videos", authMiddleware, requireInstructor, createVideoHandler);
router.put("/instructor/videos/:id", authMiddleware, requireInstructor, updateVideoHandler);
router.delete("/instructor/videos/:id", authMiddleware, requireInstructor, deleteVideoHandler);

export default router;

