import express from "express";
import { createOrder, capturePayment, sendOrderConfirmationEmail } from "../controllers/paypal.js";
import { protect } from "../controllers/user.js";

const paymentRouter = express.Router();

// Payment routes
paymentRouter.route("/checkout-session").post(protect, createOrder);
paymentRouter.route("/webhook").post(capturePayment);
paymentRouter.route("/send-email").post(sendOrderConfirmationEmail);

export default paymentRouter;
