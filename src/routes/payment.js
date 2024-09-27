import express from "express";
import paypalCheckout from "../controllers/paypal.js";
import { protect } from "../controllers/user.js";

const paymentRouter = express.Router();

// Payment routes
paymentRouter.route("/checkout-session").post(protect, paypalCheckout);
// paymentRouter.route("/webhook").post(webhook);

export default paymentRouter;
