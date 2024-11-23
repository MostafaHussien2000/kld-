const express = require('express');

const {
  createCashOrder,
  getAllOrders,
  getSpecificOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDeliver,
  checkoutSession,
  cancelOrder,
} = require('../services/orderService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);

router.get(
  '/checkout-session/:cartId',
  authService.allowedTo('user'),
  checkoutSession
);

router.post('/:cartId', createCashOrder);
router.get(
  '/',
  authService.allowedTo('user', 'admin'),
  filterOrderForLoggedUser,
  getAllOrders
);
router.get('/:id', getSpecificOrder);

router.put('/:id/pay', authService.allowedTo('admin'), updateOrderToPaid);
router.put(
  '/:id/deliver',
  authService.allowedTo('admin'),
  updateOrderToDeliver
);
router.put('/:id/cancel', authService.allowedTo('user'), cancelOrder);

module.exports = router;
