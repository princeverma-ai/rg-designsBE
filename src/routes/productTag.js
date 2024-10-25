import express from "express";
import { getAllTags, getTag, createTag, updateTag, deleteTag } from "../controllers/productTag.js";
import { protect, restrictTo } from "../controllers/user.js";

// Create a new router instance
const productTagRouter = express.Router();

productTagRouter.route("/").get(getAllTags).post(protect, createTag);

productTagRouter.route("/:id").get(getTag).patch(protect, updateTag).delete(restrictTo("admin"), deleteTag);

// Export the router
export default productTagRouter;
