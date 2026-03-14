import { Schema, Document } from "mongoose";

export interface IQuiz extends Document {
    question: string;
    options: string[];
    correctAnswer: string;
}

export const QuizSchema = new Schema<IQuiz>({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: (val: string[]) => val.length >= 2,
            message: "A quiz must have at least 2 options",
        },
    },
    correctAnswer: {
        type: String,
        required: true,
        trim: true,
    },
});