const fs = require('fs/promises');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');
const factory = require('./handlerFactory');
const generateToken = require('../utils/generateToken');
const cloud = require('../utils/uploadImgCloudinary');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');

exports.uploadUserImage = uploadSingleImage('profileImg');

// Image processing
exports.uploadImages = asyncHandler(async (req, file, next) => {
  if (req.file) {
    const result = await cloud.uploads(req.file.path, 'usersProfile');

    req.body.profileImg = result.url;
    await fs.unlink(req.file.path); // remove images from folder uploads
  }

  next();
});

// @des Get list of users
// @route GET /api/v1/users
// @access Private/Admin-Manager
exports.getUsers = factory.getAll(User);

// @des Get specific user by Id
// @route GET /api/v1/users/:id
// @access Public/Admin
exports.getUser = factory.getOne(User);

// @des Create user
// @route POST /api/v1/users
// @access Private/Admin
exports.createUser = factory.createOne(User);

// @des update specific user by Id
// @route PUT /api/v1/users/:id
// @access Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @des delete specific user by Id
// @route DELETE /api/v1/users/:id
// @access Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @des Get logged user data
// @route GET /api/v1/users/getMe
// @access Public/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = generateToken(user._id);
  res.status(200).json({ data: user, token });
});

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImg: req.body.profileImg,
    },
    { new: true }
  );
  console.log(req.body.email);

  res.status(200).json({ data: updatedUser });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: 'Success' });
});
