const express = require('express');

const {
  getReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  setCategoryIdToBody,
  cerateFilterObj,
} = require('../services/reviewService');

const authService = require('../services/authService');
const {
  createReviewValidator,
  updateReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
} = require('../utils/validators/reviewValidator');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(cerateFilterObj, getReviews)
  .post(
    authService.protect,
    authService.allowedTo('user'),
    setCategoryIdToBody,
    createReviewValidator,
    createReview
  );
router
  .route('/:id')
  .get(getReviewValidator, getReview)
  .put(
    authService.protect,
    authService.allowedTo('user'),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo('user', 'manager', 'admin'),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
