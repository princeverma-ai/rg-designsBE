import mongoose from "mongoose";

// Define mongoose schema for productTag
const productTag = new mongoose.Schema({
  tagName: {
    type: String,
    default: null,
  },
  tagContent: {
    type: String,
    default: null,
  },
  metaTitle: {
    type: String,
    default: null,
  },
  metaContent: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    default: null,
  },

  //Optional fields
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

// Pre-find middleware to filter out deleted productTag
productTag.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Create the productTag model
const ProductTag = mongoose.model("ProductTag", productTag);

export default ProductTag;
