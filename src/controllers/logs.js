import catchAsync from "../utils/catchAsync.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Function to get all coupons
const getLogs = catchAsync(async (req, res, next) => {
  res.sendFile(path.join(__dirname, "../templates/logs.html"));
});
export default getLogs;
