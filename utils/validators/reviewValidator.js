const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewModel');

exports.getReviewValidator = [
  check('id').isMongoId().withMessage('Invalid Review id format'),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check('title').optional(),
  check('ratings')
    .notEmpty()
    .withMessage('ratings value required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be number and between 1.0 : 5.0'),
  check('user').isMongoId().withMessage('Invalid Review id format'),
  check('product')
    .isMongoId()
    .withMessage('Invalid Review id format')
    // Check if logged user create review before
    .custom(async (vale, { req }) => {
      const review = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });
      if (review) {
        return Promise.reject(new Error('You already created a review before'));
      }
    }),

  validatorMiddleware,
];

exports.updateReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom(async (val, { req }) => {
      // Check review ownership before update
      const review = await Review.findById(val);
      if (!review) {
        return Promise.reject(new Error(`There is no review  with id ${val}`));
      }
      if (review.user._id.toString() !== req.user._id.toString()) {
        return Promise.reject(
          new Error('You are not allowed to perform this action')
        );
      }
    }),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom(async (val, { req }) => {
      if (req.user.role === 'user') {
        const review = await Review.findById(val);
        if (!review) {
          return Promise.reject(
            new Error(`There is no review  with id ${val}`)
          );
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error('You are not allowed to perform this action')
          );
        }
      }
      return true;
    }),
  validatorMiddleware,
];
