import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ProductTag from "../models/productTag.js";
import APIFeatures from "../utils/ApiFeatures.js";

// Function to get all productTags
export const getAllTags = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(ProductTag.find(), req.query).filter().sort().limitFields();

  const productTags = await features.query;

  // Return the productTags
  res.status(200).json({ productTags });
});

// Function to get a single productTag
export const getTag = catchAsync(async (req, res, next) => {
  const productTagId = req.params.id;

  // Find the productTag by id
  const productTag = await ProductTag.findById(productTagId);

  // Check if the productTag exists
  if (!productTag) {
    return next(new AppError("ProductTag not found", 404));
  }

  // Return the productTag
  res.status(200).json({ productTag });
});

// Function to create a productTag
export const createTag = catchAsync(async (req, res, next) => {
  const productTag = await ProductTag.create(req.body);

  // Return the created productTag
  res.status(201).json({ productTag });
});

// Function to update a productTag
export const updateTag = catchAsync(async (req, res, next) => {
  const productTagId = req.params.id;

  // Find the productTag by id and update the details
  const productTag = await ProductTag.findByIdAndUpdate(productTagId, req.body, {
    new: true,
    runValidators: true,
  });

  // Check if the productTag exists
  if (!productTag) {
    return next(new AppError("ProductTag not found", 404));
  }

  // Return the updated productTag
  res.status(200).json({ productTag });
});

// Function to delete a productTag
export const deleteTag = catchAsync(async (req, res, next) => {
  const productTagId = req.params.id;

  // Find the productTag by id and delete it
  const productTag = await ProductTag.findByIdAndUpdate(
    productTagId,
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );

  // Check if the productTag exists
  if (!productTag) {
    return next(new AppError("ProductTag not found", 404));
  }

  // Return the deleted productTag
  res.status(204).json({ productTag });
});
