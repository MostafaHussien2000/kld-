const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: String,
        price: Number,
      },
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// cartSchema.post(/^save/, async function (next) {
//   this.populate('cartItems.product');
//   // populate product data in add to cart
//   // this.populate({ path: 'cartItems.product', select: 'name price' });

//   next();
// });

cartSchema.pre(/^find/, async function (next) {
  this.populate('cartItems.product');
  // populate product data in add to cart
  // this.populate({ path: 'cartItems.product', select: 'name price' });

  next();
});

module.exports = mongoose.model('Cart', cartSchema);
