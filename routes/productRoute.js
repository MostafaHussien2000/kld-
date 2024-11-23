const express = require('express');

const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  uploadImages,
} = require('../services/productService');
const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require('../utils/validators/productValidator');

const authService = require('../services/authService');
const reviewRoute = require('./reviewRoute');

const router = express.Router();

router.use('/:productId/reviews', reviewRoute);

router
  .route('/')
  .get(getProducts)
  .post(
    authService.protect,
    authService.allowedTo('admin'),
    uploadProductImages,
    uploadImages,
    createProductValidator,
    createProduct
  );
router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo('admin'),
    uploadProductImages,
    uploadImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
