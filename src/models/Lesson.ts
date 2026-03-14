import { Schema, Document } from "mongoose";
import { IQuiz, QuizSchema } from "./Quiz";

export interface ILesson extends Document {
    title: string;
    content: string;
    summary: string;
    videoUrl?: string;
    order: number;
    quiz: IQuiz[];
}

export const LessonSchema = new Schema<ILesson>({
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
        type: [QuizSchema],
        default: [],
    },
});