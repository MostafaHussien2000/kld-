const mongoose = require('mongoose');

// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category must be required'],
      unique: [true, 'Category must be unique'],
      minlength: [3, 'Too short name'],
      maxlength: [32, 'Too long name'],
    },
    // A and b => shopping.com/a-and-b
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
    icon: String,
  },
  { timestamps: true }
);

// const setImageUrl = (doc) => {
//   if (doc.image) {
//     const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
//     doc.image = imageUrl;
//   }

//   if (doc.icon) {
//     const iconUrl = `${process.env.BASE_URL}/categories/${doc.icon}`;
//     doc.icon = iconUrl;
//   }
// };

// // findOne, findAll and update
// categorySchema.post('init', (doc) => {
//   setImageUrl(doc);
// });

// // create
// categorySchema.post('save', (doc) => {
//   setImageUrl(doc);
// });

// 2- Create Model
module.exports = mongoose.model('Category', categorySchema);
