const asyncHandler = require('express-async-handler');

const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');

const ApiError = require('../utils/apiError');

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;

  return totalPrice;
};

// @desc Add product to cart
// @route POST /cart
// @access Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await Product.findById(productId);
  if (product.quantity < 1) {
    return next(new ApiError('This product is out of stock', 400));
  }
  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // create cart for logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // if product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) =>
        item.product._id.toString() === productId && item.color === color
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;

      cart.cartItems[productIndex] = cartItem;
    } else {
      // if product does't exist in cart, push product to cart items array
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Get Logged user cart
// @route GET /cart
// @access Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id: ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Remove cart item
// @route DELETE /cart/:itemId
// @access Private/User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.itemId } } },
    { new: true }
  );
  calcTotalCartPrice(cart);
  cart.save();

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Clear logged user cart
// @route DELETE /cart
// @access Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc Update specific cart item quantity
// @route PUT /cart/:itemId
// @access Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for user id: ${req.user._id}, 404`)
    );
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`There no item for this id : ${req.params.itemId}`, 404)
    );
  }

  calcTotalCartPrice(cart);
  cart.save();

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Apply coupon on logged user cart
// @route PUT /cart/applyCoupon
// @access Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    next(new ApiError(`Coupon is invalid or expired`, 404));
  }

  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });

  const totalPrice = cart.totalCartPrice;

  // 3) Calculate priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: 'success',
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
