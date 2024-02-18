const express = require('express');
const router = express.Router();
const{
  return_decoded_token,
  get_all_notifications,
  create_notifications,
  update_notification,
  delete_notification
} = require('../controllers/dboperations_notifications');


router.route('/user_info').get(return_decoded_token);
router.route('/user_notification/:id').get(get_all_notifications);
router.route('/new_notification').post(create_notifications);
router.route('/:id').patch(update_notification).delete(delete_notification);

module.exports = router;