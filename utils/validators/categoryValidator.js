const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Category = require('../../models/categoryModel');

exports.getCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category must be required')
    .isLength({ min: 3 })
    .withMessage('Too short name')
    .isLength({ max: 32 })
    .withMessage('Too long name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    })
    .custom(async (val, { req }) => {
      const category = await Category.findOne({ name: val });
      if (category) {
        throw new Error('This category is found');
      }
      return true;
    }),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short name')
    .isLength({ max: 32 })
    .withMessage('Too long name'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  validatorMiddleware,
];
