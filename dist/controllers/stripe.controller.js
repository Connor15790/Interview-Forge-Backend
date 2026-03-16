"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createCheckout = void 0;
const stripe_1 = __importDefault(require("stripe"));
const User_1 = __importDefault(require("../models/User"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const createCheckout = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.plan === "pro") {
            return res.status(400).json({ message: "You are already on the Pro plan" });
        }
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer_email: user.email,
            client_reference_id: user._id.toString(),
            line_items: [
                {
                    price: process.env.PRO_SUBSCRIPTION,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/upgrade?cancelled=true`,
        });
        return res.status(200).json({ url: session.url });
    }
    catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createCheckout = createCheckout;
const verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log("payment_status:", session.payment_status);
        console.log("client_reference_id:", session.client_reference_id);
        console.log("req.user._id:", req.user?._id);
        if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed" });
        }
        if (session.client_reference_id !== req.user?._id) {
            return res.status(403).json({ message: "Session does not belong to this user" });
        }
        await User_1.default.findByIdAndUpdate(req.user?._id, {
            plan: "pro",
            stripeCustomerId: session.customer,
        });
        return res.status(200).json({ message: "Plan upgraded to Pro successfully" });
    }
    catch (error) {
    }
};
exports.verifyPayment = verifyPayment;
