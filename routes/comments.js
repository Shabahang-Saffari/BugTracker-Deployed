const express = require('express');
const router = express.Router();
const{
  get_all_comments,
  get_all_comments_qty,
  get_single_comment,
  create_comment,
  update_comment,
  delete_comment,
  search_comments,
  search_comments_qty
} = require('../controllers/dboperations_comments');


router.route('/').post(create_comment);
router.route('/:id').post(get_all_comments).patch(update_comment).delete(delete_comment);
router.route('/single_comment/:id').get(get_single_comment)
router.route('/all_comments_qty/:id').get(get_all_comments_qty);
router.route('/search_comments/:id').post(search_comments);
router.route('/search_comments_qty/:id').get(search_comments_qty);

module.exports = router;