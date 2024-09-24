import nodemailer from "nodemailer";

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Define a function to send an email
const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};

export default sendEmail;
