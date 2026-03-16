"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizSchema = void 0;
const mongoose_1 = require("mongoose");
exports.QuizSchema = new mongoose_1.Schema({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: (val) => val.length >= 2,
            message: "A quiz must have at least 2 options",
        },
    },
    correctAnswer: {
        type: String,
        required: true,
        trim: true,
    },
});
