import querystring from "querystring";
import fetch from "node-fetch";
import sendEmail from "../utils/email.js";
import fs from "fs";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const paypalCheckout = async (req, res) => {
  const { amount, email } = req.body;

  const api_username = "rgembroiderydesigns_api1.gmail.com";
  const api_password = "3T45GNK64PDA2HRU";
  const api_signature = "AYKbYbGCvOInUYMA-XnVG0kukgglA607QURtSQ4MLMEpAOmbn2YPAN-H";
  const version = "124.0";

  // PayPal NVP API parameters for setting up express checkout
  const params = {
    USER: api_username,
    PWD: api_password,
    SIGNATURE: api_signature,
    VERSION: version,
    METHOD: "SetExpressCheckout",
    PAYMENTREQUEST_0_AMT: amount,
    PAYMENTREQUEST_0_CURRENCYCODE: "USD",
    PAYMENTREQUEST_0_PAYMENTACTION: "Sale",
    RETURNURL: "https://your-site.com/success",
    CANCELURL: "https://your-site.com/cancel",
  };

  const apiEndpoint = "https://api-3t.sandbox.paypal.com/nvp";

  try {
    // Make POST request to PayPal API
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: querystring.stringify(params),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const responseText = await response.text();
    const parsedResponse = querystring.parse(responseText);

    // Check PayPal response status
    if (parsedResponse.ACK === "Success") {
      // Return the token to client
      res.json({ success: true, token: parsedResponse.TOKEN });
    } else {
      res.status(400).json({
        success: false,
        message: parsedResponse.L_LONGMESSAGE0 || "Failed to initiate PayPal checkout.",
      });
    }

    setTimeout(async () => {
      const templatePath = path.join(__dirname, "..", "templates", "index.html");
      const template = fs.readFileSync(templatePath, "utf-8");
      const emailData = {
        customerName: req.body.customerName,
        products: req.body.products,
        totalAmount: 89.97,
        zipLinks: req.body.zipLinks,
      };
      // Render the template with the data
      const html = ejs.render(template, emailData);
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "Order Confirmation",
        html: html,
      };
      await sendEmail(mailOptions);
      console.log("Email sent successfully");
    }, 2000);
  } catch (error) {
    console.error("Error in PayPal API call:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default paypalCheckout;
