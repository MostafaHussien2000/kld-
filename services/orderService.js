const stripe = require('stripe')(process.env.STRIPE_SECRET);
const asyncHandler = require('express-async-handler');
const factory = require('./handlerFactory');

const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

// @desc   create cash order
// @route  POST /orders/cartId
// @access Private/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // App setting
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.body.cartId}`, 404)
    );
  }
  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create order with default paymentMthodType cash and status pending
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    status: 'pending',
  });
  // 4) After creating order, decrement product quantity, and increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: 'success', data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObj = { user: req.user._id };
  next();
});

// @desc   get all orders
// @route  POST /orders
// @access Private/User-Admin
exports.getAllOrders = factory.getAll(Order);

// @desc   get specific order
// @route  POST /orders/id
// @access Private/User-Admin
exports.getSpecificOrder = factory.getOne(Order);

// @desc   update order paid status to paid
// @route  POST /orders/:id/pay
// @access Private/Admin
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`There is no such order with id: ${req.params.id}`, 404)
    );
  }
  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'delivered';

  const updatedOrder = await order.save();
  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc   update order paid status to delivered
// @route  POST /orders/:id/deliver
// @access Private/Admin
exports.updateOrderToDeliver = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`There is no such order with id: ${req.params.id}`, 404)
    );
  }
  order.isDelivered = true;
  order.status = 'delivered';
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc   Get checkout session from stripe and send it as response
// @route  GET /orders/checkout-session/cartId
// @access Private/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // App setting
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.body.cartId}`, 404)
    );
  }
  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: req.user.name,
            description: 'welcome in Furnival',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    // success_url: `${req.protocol}://${req.get('host')}/orders`,
    // cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    // success_url: 'http://localhost:5173/successOrder',
    // cancel_url: 'http://localhost:5173/cart',
    // success_url: 'https://user-liard-alpha.vercel.app/profile#order',
    // cancel_url: 'https://user-liard-alpha.vercel.app/cart',
    success_url: 'https://user-liard-alpha.vercel.app',
    cancel_url: 'https://user-liard-alpha.vercel.app',
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: 'success', session });
});

const createCardOrder = async (session) => {
  // 1) Get cart depend on cartId
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 2) Create order with default paymentMthodType card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
  });

  // 3) After creating order, decrement product quantity, and increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 4) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};

// @desc   This webhook will be called when checkout session completed
// @route  POST /webhook-checkout
// @access Private/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    // Create order after checkout session completed
    createCardOrder(event.data.object);
  }
  res.status(200).json({ received: true });
});

// @desc   Cancel user's own order
// @route  PUT /orders/:id/cancel
// @access Private/User
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ApiError(`There is no order with id: ${req.params.id}`, 404)
    );
  }

  // Check if the user is the owner of the order
  if (order.user.toString() !== req.user._id.toString()) {
    return next(
      new ApiError(`You are not authorized to cancel this order.`, 403)
    );
  }

  // Check if the order is in a cancellable state (e.g., pending or in progress)
  if (order.status === 'canceled' || order.status === 'delivered') {
    return next(new ApiError(`This order cannot be canceled.`, 400));
  }

  // Update the order status to canceled
  order.status = 'canceled';

  const updatedOrder = await order.save();
  res.status(200).json({ status: 'success', data: updatedOrder });
});
// don't forget validate for specific order
