"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeLesson = exports.getMyEnrollments = exports.enrollUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const sendcertificate_service_1 = require("../utils/sendcertificate.service");
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const Course_1 = __importDefault(require("../models/Course"));
const User_1 = __importDefault(require("../models/User"));
// Enroll user in a course
const enrollUser = async (req, res) => {
    try {
        const courseId = new mongoose_1.default.Types.ObjectId(req.params["courseId"]);
        const userId = new mongoose_1.default.Types.ObjectId(req.user?._id);
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (!course.isPublic && course.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        const enrollment = await Enrollment_1.default.create({
            userId,
            courseId,
        });
        return res.status(201).json({ message: "Enrolled successfully", enrollment });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "You are already enrolled in this course" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.enrollUser = enrollUser;
// Get current user's enrollments and progress
const getMyEnrollments = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?._id;
        const enrollment = await Enrollment_1.default.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }
        return res.status(200).json(enrollment);
    }
    catch (error) {
        console.error("Error fetching enrollment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getMyEnrollments = getMyEnrollments;
// Mark a lesson as complete and check if course is fully done
const completeLesson = async (req, res) => {
    try {
        const courseId = req.params["courseId"];
        const lessonId = req.params["lessonId"];
        const userId = new mongoose_1.default.Types.ObjectId(req.user?._id);
        const enrollment = await Enrollment_1.default.findOne({ userId, courseId });
        if (!enrollment) {
            res.status(404).json({ message: "Enrollment not found. Please enroll first." });
            return;
        }
        // $addToSet prevents duplicate lessonIds in the progress array
        await Enrollment_1.default.findByIdAndUpdate(enrollment._id, {
            $addToSet: { progress: lessonId },
        });
        // Check if all lessons are now complete
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        const updatedEnrollment = await Enrollment_1.default.findById(enrollment._id);
        const totalLessons = course.lessons.length;
        const completedLessons = updatedEnrollment?.progress.length ?? 0;
        const isCourseComplete = completedLessons >= totalLessons;
        if (isCourseComplete && !updatedEnrollment?.completedAt) {
            await Enrollment_1.default.findByIdAndUpdate(enrollment._id, {
                completedAt: new Date(),
            });
            const user = await User_1.default.findById(userId);
            if (user) {
                await (0, sendcertificate_service_1.sendCertificateEmail)({
                    toEmail: user.email,
                    userName: user.name,
                    courseTitle: course.title,
                    courseTopic: course.topic,
                    completedAt: new Date(),
                });
            }
        }
        return res.status(200).json({
            message: "Lesson marked as complete",
            progress: updatedEnrollment?.progress,
            completedLessons,
            totalLessons,
            isCourseComplete,
        });
    }
    catch (error) {
        console.error("Error completing lesson:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.completeLesson = completeLesson;
