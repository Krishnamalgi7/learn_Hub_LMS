import { Router } from "express";
import { getSectionHandler, listSectionsHandler } from "./section.controller";

const router = Router();

// Not currently mounted from `routes/index.ts`, but kept for completeness.
router.get("/subjects/:subjectId/sections", listSectionsHandler);
router.get("/sections/:id", getSectionHandler);

export default router;

