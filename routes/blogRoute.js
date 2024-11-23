const express = require('express');

const {
  getBlog,
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImages,
  uploadImages,
} = require('../services/blogService');
const {
  getBlogValidator,
  createBlogValidator,
  updateBlogValidator,
  deleteBlogValidator,
} = require('../utils/validators/blogValidator');

const authService = require('../services/authService');

const router = express.Router();

router
  .route('/')
  .get(getBlogs)
  .post(
    authService.protect,
    authService.allowedTo('admin'),
    uploadBlogImages,
    uploadImages,
    createBlogValidator,
    createBlog
  );
router
  .route('/:id')
  .get(getBlogValidator, getBlog)
  .put(
    authService.protect,
    authService.allowedTo('admin'),
    uploadBlogImages,
    uploadImages,
    updateBlogValidator,
    updateBlog
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteBlogValidator,
    deleteBlog
  );

module.exports = router;
