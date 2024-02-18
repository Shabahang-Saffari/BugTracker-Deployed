const express = require('express');
const router = express.Router();
const{
  number_of_all_projects,
  number_of_dashboard_projects,
  get_all_projects,
  all_prjs_selected_user_dash,
  all_prjs_selected_user_dash_qty,
  get_all_projects_proj_page,
  all_prjs_selected_user_proj_page,
  all_prjs_selected_user_proj_page_qty,
  get_project,
  create_project,
  create_project_users,
  update_project,
  delete_project,
  delete_project_users,
  search_project,
  search_project_qty,
  search_prjs_selected_user_dash,
  search_prjs_selected_user_dash_qty,
  search_project_page,
  search_project_page_qty,
  search_prjs_page_selected_user,
  search_prjs_page_selected_user_qty
} = require('../controllers/dboperations_projects.js');



router.route('/').get(get_all_projects).post(create_project);
router.route('/dash_selective_prjs').post(all_prjs_selected_user_dash);
router.route('/dash_selective_prjs_qty').post(all_prjs_selected_user_dash_qty);
router.route('/projs_page').get(get_all_projects_proj_page);
router.route('/projs_page_selective_prjs').post(all_prjs_selected_user_proj_page);
router.route('/projs_page_selective_prjs_qty').post(all_prjs_selected_user_proj_page_qty);
router.route('/number_of_projects').get(number_of_all_projects);
router.route('/number_of_dash_projects').get(number_of_dashboard_projects);
router.route('/search').get(search_project);
router.route('/search_dash_selective').post(search_prjs_selected_user_dash);
router.route('/search_dash_selective_qty').post(search_prjs_selected_user_dash_qty);
router.route('/search_project_qty').get(search_project_qty);
router.route('/search_proj_page').get(search_project_page).post(search_prjs_page_selected_user);
router.route('/search_proj_page_qty').get(search_project_page_qty).post(search_prjs_page_selected_user_qty);
router.route('/:id').get(get_project).patch(update_project).delete(delete_project);
router.route('/delete_proj_users/:id').delete(delete_project_users);
router.route('/create_proj_users/:id').post(create_project_users);


module.exports = router;