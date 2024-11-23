const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      res: 'User',
      required: [true, 'Order must be belong to use'],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    paymentMethodType: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    status: {
      type: String,
      enum: ['pending', 'delivered', 'canceled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name profileImage email phone',
  }).populate({
    path: 'cartItems.product',
    select: 'title imageCover',
  });

  next();
});

module.exports = mongoose.model('Order', orderSchema);

// add status => canceled (user, admin) when it pending
// => pending delivered (admin)
