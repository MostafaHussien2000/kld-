const express = require('express');
const {
  addAddress,
  getLoggedUserAddresses,
  removeAddress,
  updateAddress,
} = require('../services/addressService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));

router.route('/').post(addAddress).get(getLoggedUserAddresses);

router.delete('/:addressId', removeAddress);
router.put('/:addressId', updateAddress);

module.exports = router;