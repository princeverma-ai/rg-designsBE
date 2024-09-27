import sendEmail from "../utils/email.js";
import fs from "fs";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

import Transaction from "../models/transaction.js";

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// paypalController.js
import client from "../utils/paypal.js";
import paypal from "@paypal/checkout-server-sdk";

// Create PayPal Order
const createOrder = async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.headers["Content-Type"] = "application/json";

  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: req.body.totalAmount,
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    await Transaction.create({
      lineItems: req.body.products,
      user: req.body.userId,
      amount: req.body.totalAmount,
      paypalId: order.result.id,
    });
    res.status(200).json({
      id: order.result.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Capture PayPal Payment
const capturePayment = async (req, res) => {
  const { orderID } = req.query;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);

  try {
    const capture = await client.execute(request);
    await Transaction.findOneAndUpdate({ paypalId: orderID }, { isPaid: true });
    res.status(200).json({
      status: capture.result.status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendOrderConfirmationEmail = async (req, res) => {
  try {
    const templatePath = path.join(__dirname, "..", "templates", "index.html");
    const template = fs.readFileSync(templatePath, "utf-8");
    const emailData = {
      customerName: req.body.customerName,
      products: req.body.products,
      totalAmount: req.body.totalAmount,
      zipLinks: req.body.zipLinks,
    };
    // Render the template with the data
    const html = ejs.render(template, emailData);
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: req.body.email,
      subject: "Order Confirmation",
      html: html,
    };
    await sendEmail(mailOptions);
    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    req.status(500).json({ error: error.message });
  }
};

export { createOrder, capturePayment, sendOrderConfirmationEmail };
