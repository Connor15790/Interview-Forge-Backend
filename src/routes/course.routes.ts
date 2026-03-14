import express from "express";

const router = express.Router();

import { verifyToken } from "../middleware/verifyToken";

import * as courseController from "../controllers/course.controller";

router.get("/fetchAllCourses", courseController.fetchCourses);
router.get("/fetchMyCourse", verifyToken, courseController.fetchMyCourses);
router.get(
  "/fetchCourseById/:id",
  verifyToken,
  courseController.fetchCourseById,
);
router.post("/createCourse", verifyToken, courseController.createCourse);
router.delete("/deleteCourse/:id", verifyToken, courseController.deleteCourse);
router.patch(
  "/togglePublic/:id",
  verifyToken,
  courseController.makePrivateCourse,
);

export default router;
