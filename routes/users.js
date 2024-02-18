const express = require('express');
const router = express.Router();
const{
  get_all_users,
  search_all_users,
  get_user,
  get_all_prj_assigned_users,
  get_assigned_users_ticket,
  get_prj_contributors_info,
  create_user,
  update_user,
  delete_user
} = require('../controllers/dboperations_users');


router.route('/').get(get_all_users).post(create_user);
router.route('/search_users').get(search_all_users);
router.route('/project_assigned_users/:id').get(get_all_prj_assigned_users);
router.route('/ticket_assigned_users/:id').get(get_assigned_users_ticket);
router.route('/:id').get(get_user).patch(update_user).delete(delete_user);
router.route('/prj_contributors_info/:id').get(get_prj_contributors_info);

module.exports = router;