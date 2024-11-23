const fs = require('fs/promises');
// const sharp = require('sharp');
// const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');
const Product = require('../models/productModel');
const factory = require('./handlerFactory');
const cloud = require('../utils/uploadImgCloudinary');

exports.uploadProductImages = uploadMixOfImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

// exports.uploadCategoryImage = uploadMixOfImages([
//   { name: 'image', maxCount: 1 },
//   { name: 'icon', maxCount: 1 },
// ]);

exports.uploadImages = asyncHandler(async (req, res, next) => {
  // 1) Image processing for imageCover
  if (req.files.imageCover) {
    const result = await cloud.uploads(
      req.files.imageCover[0].path,
      'productsImageCover'
    );

    // save image into our db
    req.body.imageCover = result.url;
    await fs.unlink(req.files.imageCover[0].path); // remove images from folder uploads
  }

  req.body.images = [];
  if (req.files.images) {
    await Promise.all(
      req.files.images.map(async (img) => {
        const result = await cloud.uploads(img.path, 'productsImage');

        // save image into our db
        req.body.images.push(result.url);
        await fs.unlink(img.path); // remove images from folder uploads
      })
    );
  }
  next();
});

// @des Get list of Products
// @route GET /products
// @access Public
exports.getProducts = factory.getAll(Product);

// @des Get specific product by Id
// @route GET /products/:id
// @access Public
exports.getProduct = factory.getOne(Product, 'reviews');

// @des Create products
// @route POST /products
// @access Private/Admin
exports.createProduct = factory.createOne(Product);

// @des update specific product by Id
// @route PUT /products/:id
// @access Private/Admin
exports.updateProduct = factory.updateOne(Product);

// @des delete specific product by Id
// @route DELETE /products/:id
// @access Private/Admin
exports.deleteProduct = factory.deleteOne(Product);
