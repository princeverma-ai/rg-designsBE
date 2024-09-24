import express from "express";
import { checkoutSession, webhook } from "../controllers/payment.js";
import { protect } from "../controllers/user.js";

const paymentRouter = express.Router();

// Payment routes
paymentRouter.route("/checkout-session").post(protect, checkoutSession);
paymentRouter.route("/webhook").post(webhook);

export default paymentRouter;
