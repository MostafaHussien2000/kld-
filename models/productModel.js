const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title must be required'],
      trim: true,
      minLength: [3, 'Too short product title'],
      maxLength: [100, 'Too long product title'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description must be required'],
      minLength: [100, 'Too short product description'],
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity must be required'],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Product price must be required'],
      trim: true,
      max: [200000, 'Too long product price'],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],
    imageCover: {
      type: String,
      required: [true, 'Product Image cover is required'],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must be belong to category'],
    },
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: 'Brand',
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// Mongoose query middleware
productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name -_id' });
  next();
});

// const setImageUrl = (doc) => {
//   if (doc.imageCover) {
//     const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
//     doc.imageCover = imageUrl;
//   }
//   if (doc.images) {
//     const listImages = [];
//     doc.images.forEach((img) => {
//       const imageUrl = `${process.env.BASE_URL}/products/${img}`;
//       listImages.push(imageUrl);
//     });
//     doc.images = listImages;
//   }
// };

// // findOne, findAll and update
// productSchema.post('init', (doc) => {
//   setImageUrl(doc);
// });

// // create
// productSchema.post('save', (doc) => {
//   setImageUrl(doc);
// });

module.exports = mongoose.model('Product', productSchema);
