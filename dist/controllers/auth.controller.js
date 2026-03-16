"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserProfile = exports.fetchUser = exports.loginUser = exports.signUpUser = exports.upsertUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
}
// Google sign in controller
const upsertUser = async (req, res) => {
    try {
        const { name, email, image } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required!" });
        }
        const user = await User_1.default.findOneAndUpdate({ email }, {
            $setOnInsert: {
                plan: "free",
                authProvider: "google",
                coursesGeneratedThisMonth: 0,
            },
            $set: { name, image },
        }, { upsert: true, new: true });
        res.status(200).json({ message: "User inserted!", user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error!" });
    }
};
exports.upsertUser = upsertUser;
// Local sign up controller
const signUpUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!email || !password || !name) {
            return res
                .status(400)
                .json({ message: "Email and password are required!" });
        }
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            if (existingUser.authProvider === "google") {
                res.status(409).json({
                    message: "This email is registered with Google. Please sign in with Google.",
                });
            }
            else {
                res
                    .status(409)
                    .json({ message: "An account with this email already exists" });
            }
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const user = await User_1.default.create({
            name,
            email,
            password: hashedPassword,
            authProvider: "local",
            plan: "free",
            coursesGeneratedThisMonth: 0,
        });
        const token = signToken({
            _id: user._id.toString(),
            email: user.email,
            plan: user.plan,
        });
        return res.status(200).json({
            message: "User signed up successfully!",
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                plan: user.plan,
            },
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error!" });
    }
};
exports.signUpUser = signUpUser;
// Local sign in controller
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required!" });
        }
        const user = await User_1.default.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ message: "Invalid email or password!" });
        }
        if (user?.authProvider === "google") {
            res.status(401).json({
                message: "This account uses Google sign in. Please continue with Google.",
            });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password!" });
        }
        const token = signToken({
            _id: user._id.toString(),
            email: user.email,
            plan: user.plan,
        });
        return res.status(200).json({
            message: "User logged in successfully!",
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                plan: user.plan,
            },
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error!" });
    }
};
exports.loginUser = loginUser;
// Fetch user controller
const fetchUser = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const token = signToken({
            _id: user._id.toString(),
            email: user.email,
            plan: user.plan,
        });
        return res.status(200).json({ ...user.toObject(), token });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.fetchUser = fetchUser;
// Fetch user profile
const fetchUserProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.fetchUserProfile = fetchUserProfile;
