"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonSchema = void 0;
const mongoose_1 = require("mongoose");
const Quiz_1 = require("./Quiz");
exports.LessonSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
    },
    order: {
        type: Number,
        required: true,
    },
    quiz: {
        type: [Quiz_1.QuizSchema],
        default: [],
    },
});
