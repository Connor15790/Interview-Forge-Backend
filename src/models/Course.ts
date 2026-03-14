import mongoose, { Document, Schema } from "mongoose";
import { ILesson, LessonSchema } from "./Lesson";

export interface ICourse extends Document {
  title: string;
  topic: string;
  description: string;
  difficulty: string;
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  thumbnail?: string;
  lessons: ILesson[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    thumbnail: {
      type: String,
    },
    lessons: {
      type: [LessonSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model<ICourse>("Course", CourseSchema);
