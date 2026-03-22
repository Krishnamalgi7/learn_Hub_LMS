import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getVideoHandler } from "./video.controller";

const router = Router();

router.get("/videos/:id", authMiddleware, getVideoHandler);

export default router;

