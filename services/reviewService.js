const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// Nested route
// GET /api/v1/products/:products/reviews
exports.cerateFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// @des Get list of reviews
// @route GET /api/v1/reviews
// @access Public
exports.getReviews = factory.getAll(Review);

// @des Get specific review by Id
// @route GET /api/v1/reviews/:id
// @access Public
exports.getReview = factory.getOne(Review);

exports.setCategoryIdToBody = (req, res, next) => {
  // Nested route
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @des Create review
// @route POST /api/v1/reviews
// @access Protect/User
exports.createReview = factory.createOne(Review);

// @des update specific review by Id
// @route PUT /api/v1/reviews/:id
// @access Protect/User
exports.updateReview = factory.updateOne(Review);

// @des delete specific review by Id
// @route DELETE /api/v1/reviews/:id
// @access Protect/User-Admin-Manager
exports.deleteReview = factory.deleteOne(Review);
