import express from "express";

const router = express.Router();

import { verifyToken } from "../middleware/verifyToken";

import * as uploadThumbnailController from "../controllers/uploadthumnail.controller";

router.post("/uploadThumbnail", verifyToken, uploadThumbnailController.postThumbnail);

export default router;
