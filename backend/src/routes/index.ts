import { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  signupHandler,
} from "../modules/auth/auth.controller";
import subjectRoutes from "../modules/subject/subject.routes";
import videoRoutes from "../modules/video/video.routes";
import progressRoutes from "../modules/progress/progress.routes";
import enrollmentRoutes from "../modules/enrollment/enrollment.routes";
import instructorRoutes from "../modules/instructor/instructor.routes";

const router = Router();

// Health
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth
router.post("/auth/signup", signupHandler);
router.post("/auth/login", loginHandler);
router.post("/auth/logout", logoutHandler);
router.post("/auth/refresh", refreshHandler);

// LMS
router.use("/", subjectRoutes);
router.use("/", videoRoutes);
router.use("/", progressRoutes);
router.use("/", enrollmentRoutes);
router.use("/", instructorRoutes);

export default router;

