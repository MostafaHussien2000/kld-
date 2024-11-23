const express = require('express');

const {
  signupUserValidator,
  loginUserValidator,
} = require('../utils/validators/authValidator');
const {
  signup,
  login,
  forgotPassword,
  verifyPassRestCode,
  resetPassword,
} = require('../services/authService');

const router = express.Router();

router.post('/signup', signupUserValidator, signup);
router.post('/login', loginUserValidator, login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPassRestCode);
router.put('/resetPassword', resetPassword);

module.exports = router;
