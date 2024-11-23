const fs = require('fs/promises');
const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel');
const factory = require('./handlerFactory');
const cloud = require('../utils/uploadImgCloudinary');

const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');

exports.uploadCategoryImage = uploadMixOfImages([
  { name: 'image', maxCount: 1 },
  { name: 'icon', maxCount: 1 },
]);

// Image processing
exports.uploadImages = asyncHandler(async (req, file, next) => {
  // 1) Image processing for category
  if (req.files.image) {
    const result = await cloud.uploads(
      req.files.image[0].path,
      'categoriesImage'
    );
    // save image into our db
    req.body.image = result.url;
    await fs.unlink(req.files.image[0].path); // remove images from folder uploads
  }

  if (req.files.icon) {
    const result = await cloud.uploads(
      req.files.icon[0].path,
      'categoriesIcon'
    );

    req.body.icon = result.url;
    await fs.unlink(req.files.icon[0].path); // remove images from folder uploads
  }

  // Save image and icon into our db
  next();
});

// @des Get list of Categories
// @route GET /api/v1/categories
// @access Publics
exports.getCategories = factory.getAll(Category);

// @des Get specific category by Id
// @route GET /api/v1/categories/:id
// @access Public
exports.getCategory = factory.getOne(Category);

// @des Create Categories
// @route POST /api/v1/categories
// @access Private/Admin-Manager
exports.createCategory = factory.createOne(Category);

// @des update specific category by Id
// @route PUT /api/v1/categories/:id
// @access Private/Admin-Manager
exports.updateCategory = factory.updateOne(Category);

// @des delete specific category by Id
// @route DELETE /api/v1/categories/:id
// @access Private/Admin
exports.deleteCategory = factory.deleteOne(Category);
