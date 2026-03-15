import express from "express";

const router = express.Router();

import { verifyToken } from "../middleware/verifyToken";

import * as generateCourseController from "../controllers/generate.controller";

router.post("/generateCourse", verifyToken, generateCourseController.generateCourse);

export default router;
