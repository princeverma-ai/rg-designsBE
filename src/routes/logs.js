import express from "express";
import getLogs from "../controllers/logs.js";
const logsRouter = express.Router();

logsRouter.route("/").get(getLogs);

export default logsRouter;
