import express from "express";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import router from "./routes.js";

// Import AppError && errorHandler
import AppError from "./utils/AppError.js";
import errorHandler from "./utils/errorHandler.js";
// Get the current directory name in an ES module
// Create a new express application instance
const app = express();

// Enable CORS
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:3000",
      "https://www.rgembroiderydesigns.com",
      "https://api.rgembroiderydesigns.com",
      "https://rgembroiderydesigns.com",
      "http://dashboard.rgembroiderydesigns.com",
      "https://dashboard.rgembroiderydesigns.com",
    ],
    credentials: true,
  })
);
app.options("*", cors());

// Setup log files
// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, "../logs", "app.log");
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "");
}
app.logFilePath = logFilePath;
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });
app.use(
  morgan(
    (tokens, req, res) => {
      return [
        `[${new Date().toISOString()}]`,
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        `- ${tokens["response-time"](req, res)} ms`,
      ].join(" ");
    },
    { stream: logStream }
  )
);
app.use("/public", express.static("/root/rg-designsBE/public"));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Routes
app.use("/api", router);

// Invalid route handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handler
app.use(errorHandler);

// Export the app
export default app;
