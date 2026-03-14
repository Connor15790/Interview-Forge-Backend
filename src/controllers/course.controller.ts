import { Request, Response } from "express";

import { verifyToken, AuthRequest } from "../middleware/verifyToken";

import Course from "../models/Course";

// Fetch all public courses
export const fetchCourses = async (res: Response) => {
  try {
    const courses = await Course.find({ isPublic: true })
      .populate("createdBy", "name image")
      .sort({ createdAt: -1 });

    return res.status(200).json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

// Fetch user's own courses
export const fetchMyCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find({ createdBy: req.user?._id })
      .populate("createdBy", "name image")
      .sort({ createdAt: -1 });

    return res.status(200).json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

// Fetch single course
export const fetchCourseById = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "createdBy",
      "name image",
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    if (
      !course.isPublic &&
      course.createdBy?._id.toString() !== req.user?._id
    ) {
      return res.status(403).json({ message: "This is a private course!" });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a course
export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { title, topic, description, difficulty, lessons, thumbnail } =
      req.body;

    if (!title || !topic || !description || !lessons?.length) {
      return res.status(400).json({
        message: "Title, topic, description, and lessons are required!",
      });
    }

    const course = await Course.create({
      title,
      topic,
      description,
      difficulty,
      lessons,
      thumbnail,
      createdBy: req.user?._id,
      isPublic: true,
    });

    return res.status(200).json({ message: "Course created!", course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a course
export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    if (course?.createdBy.toString() !== req.user?._id) {
      return res
        .status(404)
        .json({ message: "This course belongs to another user!" });
    }

    await course.deleteOne();

    return res.status(200).json({ message: "Deleted course successfully!" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Make a course private
export const makePrivateCourse = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.plan !== "pro") {
      return res
        .status(403)
        .json({ message: "This feature is only available for pro users!" });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    if (course?.createdBy.toString() !== req.params.id) {
      return res
        .status(404)
        .json({ message: "This course belongs to another user!" });
    }

    course.isPublic = !course.isPublic;
    await course.save();

    return res.status(200).json({
      message: `Course is now ${course.isPublic ? "public" : "private"}`,
    });
  } catch (error) {
    console.error("Error updating course visibility:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
