import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getSubjectProgressHandler, postVideoProgressHandler } from "./progress.controller";

const router = Router();

router.get("/progress/subjects/:subjectId", authMiddleware, getSubjectProgressHandler);
router.post("/progress/videos/:videoId", authMiddleware, postVideoProgressHandler);

export default router;

