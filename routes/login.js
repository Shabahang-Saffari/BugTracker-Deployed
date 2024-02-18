const express = require('express');
const router = express.Router();
const {
  get_user_by_email,
  reset_pass
} = require('../controllers/login');

router.route('/').post(get_user_by_email);
router.route('/reset_pass').post(reset_pass);

module.exports = router;