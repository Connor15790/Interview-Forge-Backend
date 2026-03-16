"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePrivateCourse = exports.deleteCourse = exports.createCourse = exports.fetchCourseById = exports.fetchMyCourses = exports.fetchCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
// Fetch all public courses
const fetchCourses = async (req, res) => {
    try {
        const courses = await Course_1.default.find({ isPublic: true })
            .populate("createdBy", "name image")
            .sort({ createdAt: -1 });
        return res.status(200).json(courses);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error!" });
    }
};
exports.fetchCourses = fetchCourses;
// Fetch user's own courses
const fetchMyCourses = async (req, res) => {
    try {
        const courses = await Course_1.default.find({ createdBy: req.user?._id })
            .populate("createdBy", "name image")
            .sort({ createdAt: -1 });
        return res.status(200).json(courses);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error!" });
    }
};
exports.fetchMyCourses = fetchMyCourses;
// Fetch single course
const fetchCourseById = async (req, res) => {
    try {
        const course = await Course_1.default.findById(req.params.id).populate("createdBy", "name image");
        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }
        if (!course.isPublic &&
            course.createdBy?._id.toString() !== req.user?._id) {
            return res.status(403).json({ message: "This is a private course!" });
        }
        return res.status(200).json(course);
    }
    catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.fetchCourseById = fetchCourseById;
// Create a course
const createCourse = async (req, res) => {
    try {
        const { title, topic, description, difficulty, lessons, thumbnail } = req.body;
        if (!title || !topic || !description || !lessons?.length) {
            return res.status(400).json({
                message: "Title, topic, description, and lessons are required!",
            });
        }
        const course = await Course_1.default.create({
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
    }
    catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createCourse = createCourse;
// Delete a course
const deleteCourse = async (req, res) => {
    try {
        const course = await Course_1.default.findById(req.params.id);
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
    }
    catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteCourse = deleteCourse;
// Make a course private
const makePrivateCourse = async (req, res) => {
    try {
        if (req.user?.plan !== "pro") {
            return res
                .status(403)
                .json({ message: "This feature is only available for pro users!" });
        }
        const course = await Course_1.default.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }
        if (course?.createdBy.toString() !== req.user?._id) {
            return res
                .status(404)
                .json({ message: "This course belongs to another user!" });
        }
        course.isPublic = !course.isPublic;
        await course.save();
        return res.status(200).json({
            message: `Course is now ${course.isPublic ? "public" : "private"}`,
        });
    }
    catch (error) {
        console.error("Error updating course visibility:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.makePrivateCourse = makePrivateCourse;
