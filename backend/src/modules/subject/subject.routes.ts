import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { getSubjectFullHandler, getSubjectHandler, getSubjectTreeHandler, listSubjectsHandler } from "./subject.controller";

const router = Router();

router.get("/subjects", listSubjectsHandler);
router.get("/subjects/:id", getSubjectHandler);
router.get("/subjects/:id/tree", getSubjectTreeHandler);
router.get("/subjects/:id/full", authMiddleware, getSubjectFullHandler);

export default router;

