import AppError from "./AppError.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
// Error check function
const errorCheck = (err) => {
  // Database CastError
  if (err.name === "CastError") {
    return new AppError("Invalid ID", 400);
  }

  // Database ValidationError
  if (err.name === "ValidationError") {
    return new AppError(err.message, 400);
  }

  // Duplicate key error
  if (err.name.includes("MongoServerError") && err.message.includes("duplicate key")) {
    return new AppError("Duplicate field value entered", 400);
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    return new AppError("Invalid token", 401);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    return new AppError("Token expired", 401);
  }

  // Default error
  return new AppError("Internal Server Error", 500);
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, "../../logs", "app.log");

// Function to format error logs
function formatErrorLog(err, req) {
  return (
    [
      `\n[${new Date().toISOString()}]`,
      `Error: ${err.message}`,
      `Status Code: ${err.statusCode || 500}`,
      `Stack: ${err.stack}`,
      `Request: ${req.method} ${req.originalUrl}`,
    ].join("\n") + "\n"
  );
}

// Error handler
const errorHandler = (err, req, res, next) => {
  console.log(err);
  // Format and write error log to file
  const errorLog = formatErrorLog(err, req);
  fs.appendFile(logFilePath, errorLog, (fsErr) => {
    if (fsErr) console.error("Failed to write error log:", fsErr);
  });
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  } else {
    const updatedAppError = errorCheck(err);
    return res.status(updatedAppError.statusCode).json({ message: updatedAppError.message });
  }
};

export default errorHandler;
