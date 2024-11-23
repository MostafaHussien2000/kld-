const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @des Add product to wishlist
// @route POST /api/v1/wishlist
// @access Protect/User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet => add productId to wishlist array if productId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );
  res.status(200).json({
    status: 'success',
    message: 'Product added successfully to your wishlist',
    data: user.wishlist,
  });
});

// @des Remove product from wishlist
// @route DELETE /api/v1/wishlist/:productId
// @access Protect/User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet => add productId to wishlist array if productId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );
  res.status(200).json({
    status: 'success',
    message: 'Product removed successfully from your wishlist',
    data: user.wishlist,
  });
});

// @des Get Logged user wishlist
// @route GET /api/v1/wishlist
// @access Protect/User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.status(200).json({
    status: 'success',
    result: user.wishlist.length,
    data: user.wishlist,
  });
});
