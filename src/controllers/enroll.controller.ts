import { Response } from "express";
import mongoose from "mongoose";

import { verifyToken, AuthRequest } from "../middleware/verifyToken";

import Enrollment from "../models/Enrollment";
import Course from "../models/Course";

// Enroll user in a course
export const enrollUser = async (req: AuthRequest, res: Response) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params["courseId"] as string);
        const userId = new mongoose.Types.ObjectId(req.user?._id);

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (!course.isPublic && course.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        const enrollment = await Enrollment.create({
            userId,
            courseId,
        });

        return res.status(201).json({ message: "Enrolled successfully", enrollment });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "You are already enrolled in this course" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Get current user's enrollments and progress
export const getMyEnrollments = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?._id;

        const enrollments = await Enrollment.find({ userId, courseId });

        if (!enrollments) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        return res.status(200).json(enrollments);
    } catch (error) {
        console.error("Error fetching enrollment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Mark a lesson as complete and check if course is fully done
export const completeLesson = async (req: AuthRequest, res: Response) => {
    try {
        const courseId = req.params["courseId"] as string;
        const lessonId = req.params["lessonId"] as string;
        const userId = new mongoose.Types.ObjectId(req.user?._id);

        const enrollment = await Enrollment.findOne({ userId, courseId });

        if (!enrollment) {
            res.status(404).json({ message: "Enrollment not found. Please enroll first." });
            return;
        }

        // $addToSet prevents duplicate lessonIds in the progress array
        await Enrollment.findByIdAndUpdate(enrollment._id, {
            $addToSet: { progress: lessonId },
        });

        // Check if all lessons are now complete
        const course = await Course.findById(courseId);

        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }

        const updatedEnrollment = await Enrollment.findById(enrollment._id);
        const totalLessons = course.lessons.length;
        const completedLessons = updatedEnrollment?.progress.length ?? 0;
        const isCourseComplete = completedLessons >= totalLessons;

        if (isCourseComplete && !updatedEnrollment?.completedAt) {
            await Enrollment.findByIdAndUpdate(enrollment._id, {
                completedAt: new Date(),
            });
        }

        res.status(200).json({
            message: "Lesson marked as complete",
            progress: updatedEnrollment?.progress,
            completedLessons,
            totalLessons,
            isCourseComplete,
        });
    } catch (error) {
        console.error("Error completing lesson:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}