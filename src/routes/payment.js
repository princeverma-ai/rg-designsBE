import express from "express";
import checkout from "../controllers/payment.js";
import { protect } from "../controllers/user.js";

const paymentRouter = express.Router();

// Payment routes
paymentRouter.route("/checkout-session").post(protect, checkout);

export default paymentRouter;
