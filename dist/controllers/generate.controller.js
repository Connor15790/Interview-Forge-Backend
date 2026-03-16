"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCourse = void 0;
const generative_ai_1 = require("@google/generative-ai");
const User_1 = __importDefault(require("../models/User"));
const Course_1 = __importDefault(require("../models/Course"));
const generateCourse = async (req, res) => {
    try {
        const { topic, difficulty, lessonCount } = req.body;
        if (!topic || !difficulty || !lessonCount) {
            res.status(400).json({ message: "topic, difficulty, and lessonCount are required" });
            return;
        }
        // Credit gate for free users
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (user.plan === "free" && user.coursesGeneratedThisMonth >= 3) {
            res.status(403).json({
                message: "You have reached your free tier limit of 3 courses per month. Upgrade to Pro for unlimited generations.",
            });
            return;
        }
        // Gemini prompt
        const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
You are an expert technical interview coach. Generate a structured interview preparation micro-course in valid JSON format.
 
Topic: ${topic}
Difficulty: ${difficulty}
Number of lessons: ${lessonCount}
 
Requirements:
- Each lesson must focus on a specific concept or pattern commonly asked in ${difficulty}-level ${topic} interviews
- Lesson content should be detailed, covering the concept clearly with examples
- Each quiz question should mirror real interview questions on the topic
- The summary should be a concise cheat-sheet a candidate can review before an interview
- The course title should be specific and interview-focused
 
CRITICAL RULES for quiz:
- options must be plain strings with NO letter prefixes. Do NOT write "A) option", "B) option" — just write "option"
- correctAnswer must be the EXACT full string of the correct option, copied character-for-character from the options array
- Example of CORRECT format: options: ["Horizontal scaling", "Vertical scaling", "Diagonal scaling"], correctAnswer: "Horizontal scaling"
- Example of WRONG format: options: ["A) Horizontal scaling", "B) Vertical scaling"], correctAnswer: "A"
 
Return ONLY a valid JSON object with no markdown, no backticks, no explanation. The JSON must follow this exact structure:
 
{
  "title": "course title here",
  "description": "one sentence course description",
  "lessons": [
    {
      "order": 1,
      "title": "lesson title",
      "content": "detailed lesson content with examples (minimum 150 words)",
      "summary": "concise bullet-point style revision summary",
      "quiz": [
        {
          "question": "interview-style question",
          "options": ["First option", "Second option", "Third option", "Fourth option"],
          "correctAnswer": "First option"
        }
      ]
    }
  ]
}
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Parse Gemini response
        let courseData;
        try {
            // Strip any accidental markdown fences Gemini may add
            const cleaned = text.replace(/```json|```/g, "").trim();
            courseData = JSON.parse(cleaned);
        }
        catch {
            console.error("Gemini returned invalid JSON:", text);
            res.status(500).json({ message: "Failed to parse AI response. Please try again." });
            return;
        }
        // Attach YouTube videos for Pro users 
        if (user.plan === "pro") {
            courseData.lessons = await attachYouTubeVideos(courseData.lessons, topic);
        }
        const savedCourse = await Course_1.default.create({
            title: courseData.title,
            description: courseData.description,
            topic,
            difficulty,
            lessons: courseData.lessons,
            createdBy: user._id,
            isPublic: true,
        });
        // Increment usage counter
        await User_1.default.findByIdAndUpdate(user._id, {
            $inc: { coursesGeneratedThisMonth: 1 },
        });
        return res.status(201).json({
            message: "Course generated successfully",
            course: savedCourse,
        });
    }
    catch (error) {
        console.error("Error generating course:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.generateCourse = generateCourse;
async function attachYouTubeVideos(lessons, topic) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey)
        return lessons;
    return await Promise.all(lessons.map(async (lesson) => {
        try {
            const query = encodeURIComponent(`${lesson.title} ${topic} interview`);
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            const videoId = data.items?.[0]?.id?.videoId;
            return {
                ...lesson,
                videoUrl: videoId
                    ? `https://www.youtube.com/watch?v=${videoId}`
                    : undefined,
            };
        }
        catch {
            // If YouTube call fails for a lesson, continue without the video
            return lesson;
        }
    }));
}
