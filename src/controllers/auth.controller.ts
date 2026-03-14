import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import User from "../models/User";

const router = Router();

function signToken(payload: {
  _id: string;
  email: string;
  plan: "free" | "pro";
}) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

// Google sign in controller
const upsertUser = async (req: Request, res: Response) => {
  try {
    const { name, email, image } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          plan: "free",
          authProvider: "google",
          coursesGeneratedThisMonth: 0,
        },
        $set: { name, image },
      },
      { upsert: true, new: true },
    );

    res.status(200).json({ message: "User inserted!", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

// Local sign up controller
const signUpUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email and password are required!" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.authProvider === "google") {
        res.status(409).json({
          message:
            "This email is registered with Google. Please sign in with Google.",
        });
      } else {
        res
          .status(409)
          .json({ message: "An account with this email already exists" });
      }
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
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
  } catch (error) {}
};

// Local sign in controller
const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required!" });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    if (user?.authProvider === "google") {
      res.status(401).json({
        message:
          "This account uses Google sign in. Please continue with Google.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

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
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error!" });
  }
};
