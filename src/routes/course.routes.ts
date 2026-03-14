import express from "express";

const router = express.Router();

import { verifyToken } from "../middleware/verifyToken";

import * as courseController from "../controllers/course.controller";

router.post("/fetchAllCourses", courseController.fetchCourses);
router.post("/fetchMyCourse", verifyToken, courseController.fetchMyCourses);
router.post(
  "/fetchCourseById/:id",
  verifyToken,
  courseController.fetchCourseById,
);
router.get("/createCourse", verifyToken, courseController.createCourse);
router.get("/deleteCourse/:id", verifyToken, courseController.deleteCourse);
router.get(
  "/togglePublic/:id",
  verifyToken,
  courseController.makePrivateCourse,
);

export default router;
