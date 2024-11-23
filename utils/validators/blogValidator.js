const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getBlogValidator = [
  check('id').isMongoId().withMessage('Invalid Blog id format'),
  validatorMiddleware,
];

exports.createBlogValidator = [
  check('title')
    .notEmpty()
    .withMessage('Title must be required')
    .isLength({ min: 3 })
    .withMessage('Too short name')
    .isLength({ max: 50 })
    .withMessage('Too long name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.updateBlogValidator = [
  check('id').isMongoId().withMessage('Invalid Blog id format'),
  check('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Too short name')
    .isLength({ max: 50 })
    .withMessage('Too long name'),
  body('title')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteBlogValidator = [
  check('id').isMongoId().withMessage('Invalid Blog id format'),
  validatorMiddleware,
];
