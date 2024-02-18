const express = require('express');
const router = express.Router();
const {sign_up} = require('../controllers/sign_up');

router.route('/').post(sign_up);

module.exports = router;