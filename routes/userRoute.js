const express = require('express');
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  uploadUserImage,
  uploadImages,
  deleteLoggedUserData,
} = require('../services/userService');

const {
  createUserValidator,
  getUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserPasswordValidator,
  updateLoggedUserDataValidator,
} = require('../utils/validators/userValidator');

const authService = require('../services/authService');

const router = express.Router();

router.get('/getMe', authService.protect, getLoggedUserData, getUser);
router.put(
  '/changeMyPassword',
  authService.protect,
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword
);
router.put(
  '/updateMe',
  authService.protect,
  uploadUserImage,
  uploadImages,
  updateLoggedUserDataValidator,
  updateLoggedUserData
);
router.delete('/deleteMe', deleteLoggedUserData);

router.put(
  '/changePassword/:id',
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route('/')
  .get(authService.protect, authService.allowedTo('admin', 'manager'), getUsers)
  .post(
    authService.protect,
    authService.allowedTo('admin'),
    createUserValidator,
    createUser
  );
router
  .route('/:id')
  .get(
    authService.protect,
    authService.allowedTo('admin'),
    getUserValidator,
    getUser
  )
  .put(
    authService.protect,
    authService.allowedTo('admin'),
    getUserValidator,
    updateUser
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteUserValidator,
    deleteUser
  );

module.exports = router;
