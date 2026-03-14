import express from "express";

const router = express.Router();

import { verifyToken } from "../middleware/verifyToken";

import * as enrollController from "../controllers/enroll.controller";

router.post("/:courseId", verifyToken, enrollController.enrollUser);
router.get("/:courseId", verifyToken, enrollController.getMyEnrollments);
router.post("/:courseId/lesson/:lessonId/complete", verifyToken, enrollController.completeLesson);

export default router;
