import express from "express";

const router = express.Router();

import { verifyToken } from "../middleware/verifyToken";

import * as stripeController from "../controllers/stripe.controller";

router.post("/createCheckout", verifyToken, stripeController.createCheckout);
router.post("/verifyPayment", verifyToken, stripeController.verifyPayment);

export default router;
