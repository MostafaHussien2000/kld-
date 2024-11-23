const factory = require('./handlerFactory');
const Coupon = require('../models/couponModel');

// @des Get list of coupons
// @route GET /api/v1/coupons
// @access Private/Admin-Manager
exports.getCoupons = factory.getAll(Coupon);

// @des Get specific coupon by Id
// @route GET /api/v1/coupons/:id
// @access Private/Admin-Manager
exports.getCoupon = factory.getOne(Coupon);

// @des Create coupon
// @route POST /api/v1/coupons
// @access Private/Admin-Manager
exports.createCoupon = factory.createOne(Coupon);

// @des update specific coupon by Id
// @route PUT /api/v1/coupons/:id
// @access Private/Admin-Manager
exports.updateCoupon = factory.updateOne(Coupon);

// @des delete specific coupon by Id
// @route DELETE /api/v1/coupons/:id
// @access Private/Admin-Manager
exports.deleteCoupon = factory.deleteOne(Coupon);
