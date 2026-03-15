import { Response } from "express";

import Stripe from "stripe";

import { AuthRequest } from "../middleware/verifyToken";

import User from "../models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckout = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?._id);

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
                    price: process.env.STRIPE_PRICE_ID as string,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/upgrade?cancelled=true`,
        });

        return res.status(200).json({ url: session.url });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        if (session.client_reference_id !== req.user?._id) {
            return res.status(403).json({ message: "Session does not belong to this user" });
        }

        await User.findByIdAndUpdate(req.user?._id, {
            plan: "pro",
            stripeCustomerId: session.customer as string,
        });

        return res.status(200).json({ message: "Plan upgraded to Pro successfully" });
    } catch (error) {

    }
}