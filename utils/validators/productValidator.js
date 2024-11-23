/* eslint-disable array-callback-return */
const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');

exports.createProductValidator = [
  check('title')
    .isLength({ min: 3 })
    .withMessage('must be at least 3 chars')
    .notEmpty()
    .withMessage('Product title is required')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Too long description'),
  check('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .isNumeric()
    .withMessage('Product quantity must be a number'),
  check('sold')
    .optional()
    .isNumeric()
    .withMessage('Products sold must be a number'),
  check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isNumeric()
    .withMessage('Product price must be a number')
    .isLength({ max: 32 })
    .withMessage('Too long price'),
  check('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('priceAfterDiscount must be a number')
    .isFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error('priceAfterDiscount must be lower than price');
      }
      return true;
    }),
  check('imageCover').notEmpty().withMessage('Product imageCover is required'),
  check('images')
    .optional()
    .isArray()
    .withMessage('Images should be array of string'),
  check('category')
    .notEmpty()
    .withMessage('product must be belong to a category')
    .isMongoId()
    .withMessage('Invalid ID formate')
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ),
  check('ratingsAverage')
    .optional()
    .isNumeric()
    .withMessage('ratingsAverage must be a number')
    .isLength({ min: 1 })
    .withMessage('ratingsAverage must be above or equal 1.0')
    .isLength({ max: 5 })
    .withMessage('ratingsAverage must be below or equal 5.0'),
  check('ratingQuantity')
    .optional()
    .isNumeric()
    .withMessage('ratingQuantity must be a number'),
  validatorMiddleware,
];

exports.getProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate aaaaa'),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  check('title')
    .isLength({ min: 3 })
    .withMessage('must be at least 3 chars')
    .optional(),
  check('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Too long description'),
  check('quantity')
    .optional()
    .isNumeric()
    .withMessage('Product quantity must be a number'),
  check('sold')
    .optional()
    .isNumeric()
    .withMessage('Products sold must be a number'),
  check('price')
    .optional()
    .isNumeric()
    .withMessage('Product price must be a number')
    .isLength({ max: 32 })
    .withMessage('Too long price'),
  check('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('priceAfterDiscount must be a number')
    .isFloat()
    .custom(async (value, { req }) => {
      const specificProduct = await Product.findById(req.params.id);
      if (req.body.price || specificProduct.price <= value) {
        throw new Error('priceAfterDiscount must be lower than price');
      }
      return true;
    }),
  check('colors').optional(),
  check('imageCover').optional(),
  check('images')
    .optional()
    .isArray()
    .withMessage('Images should be array of string'),
  check('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid ID formate')
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ),
  check('ratingsAverage')
    .optional()
    .isNumeric()
    .withMessage('ratingsAverage must be a number')
    .isLength({ min: 1 })
    .withMessage('ratingsAverage must be above or equal 1.0')
    .isLength({ max: 5 })
    .withMessage('ratingsAverage must be below or equal 5.0'),
  check('ratingQuantity')
    .optional()
    .isNumeric()
    .withMessage('ratingQuantity must be a number'),
  body('title')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid ID formate'),
  validatorMiddleware,
];
