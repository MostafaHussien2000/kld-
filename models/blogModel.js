const mongoose = require('mongoose');

// 1- Create Schema
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title must be required'],
      minlength: [3, 'Too short name'],
      maxlength: [50, 'Too long name'],
    },
    content: {
      type: String,
      required: [true, 'Blog content must be required'],
    },
    image: String,
    // A and b => shopping.com/a-and-b
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

// 2- Create Model
module.exports = mongoose.model('Blog', blogSchema);
