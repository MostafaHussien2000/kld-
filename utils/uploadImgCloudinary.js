const cloudinary = require('cloudinary').v2;
const ApiError = require('./apiError');
require('dotenv').config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

exports.uploads = async (file, folderName) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folderName,
    });
    return { url: result.url };
  } catch (err) {
    return new ApiError('failed to upload to cloudinary', 500);
  }
};

exports.destroy = async (file) => {
  try {
    const result = await cloudinary.uploader.destroy(file);
    return { id: result.public_id };
  } catch (err) {
    throw new ApiError('failed to destroy in cloudinary');
  }
};
