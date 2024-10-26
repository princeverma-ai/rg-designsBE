import "dotenv/config";
import mongoose from "mongoose";
import http from "http";
import * as Socket from "socket.io";
import fs from "fs";

// Handle unhandled events
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

import app from "./app.js";

// Create a server and socket.io instance
const server = http.createServer(app);
const io = new Socket.Server(server);
// Watch the log file and emit updates via WebSocket
const MAX_LOG_FILE_SIZE = 5 * 1024 * 1024; // 5MB
fs.watchFile(app.logFilePath, { interval: 1000 }, () => {
  fs.readFile(app.logFilePath, "utf8", (err, data) => {
    if (err) return console.error("Error reading log file:", err);
    fs.stat(app.logFilePath, (err, stats) => {
      if (err) return console.error("Error checking log file size:", err);

      if (stats.size > MAX_LOG_FILE_SIZE) {
        fs.writeFile(app.logFilePath, "", (err) => {
          if (err) console.error("Error clearing log file:", err);
          else console.log("Log file cleared due to size limit.");
        });
      }
    });
    io.emit("log-update", data);
  });
});

// Connect to the database
const DB_URI = process.env.DB_URI;
const PORT = process.env.PORT;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Connected to the database");
    // Start the server after successful database connection
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
