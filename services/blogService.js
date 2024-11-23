const asyncHandler = require('express-async-handler');
const fs = require('fs/promises');

const cloud = require('../utils/uploadImgCloudinary');

const factory = require('./handlerFactory');
const Blog = require('../models/blogModel');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');

exports.uploadBlogImages = uploadSingleImage('image');

exports.uploadImages = asyncHandler(async (req, file, next) => {
  if (req.file) {
    const result = await cloud.uploads(req.file.path, 'blogImage');

    req.body.image = result.url;
    await fs.unlink(req.file.path); // remove images from folder uploads
  }

  next();
});

// @des Get list of blogs
// @route GET /blogs
// @access public/User
exports.getBlogs = factory.getAll(Blog);

// @des Get specific blog by Id
// @route GET /blogs/:id
// @access Public/User
exports.getBlog = factory.getOne(Blog);

// @des Create blogs
// @route POST /blogs
// @access Private/Admin
exports.createBlog = factory.createOne(Blog);

// @des update specific blog by Id
// @route PUT /blogs/:id
// @access Private/Admin
exports.updateBlog = factory.updateOne(Blog);

// @des delete specific blog by Id
// @route DELETE /blogs/:id
// @access Private/Admin
exports.deleteBlog = factory.deleteOne(Blog);
