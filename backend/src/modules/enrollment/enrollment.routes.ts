import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { enrollHandler, listEnrollmentsHandler } from "./enrollment.controller";

const router = Router();

router.post("/enrollments", authMiddleware, enrollHandler);
router.get("/enrollments/:userId", authMiddleware, listEnrollmentsHandler);

export default router;

