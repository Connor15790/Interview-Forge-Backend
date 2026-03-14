import express from "express";

const router = express.Router();

import { verifyToken } from "../middleware/verifyToken";

import * as authController from "../controllers/auth.controller";

router.post("/upsertUser", authController.upsertUser);
router.post("/loginUser", authController.loginUser);
router.post("/signUpUser", authController.signUpUser);
router.get("/fetchUser", authController.fetchUser);
router.get("/fetchUserProfile", verifyToken, authController.fetchUserProfile);

export default router;
