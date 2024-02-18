const express = require('express');
const router = express.Router();
const{
  get_ticket,
  get_projects_tickets,
  search_tickets_proj_details,
  search_tickets_proj_details_qty,
  search_tickets_page,
  search_tickets_page_qty,
  search_tiks_page_selected_user,
  search_tiks_page_selected_user_qty,
  all_tickets_tickets_page,
  all_tickets_tickets_page_qty,
  tickets_selected_user_tickets_page,
  tickets_selected_user_tickets_page_qty,
  ticket_by_status_qty,
  ticket_by_type_qty,
  ticket_by_priority_qty,
  create_ticket,
  create_ticket_users,
  update_ticket,
  delete_ticket,
  delete_ticket_users
} = require('../controllers/dboperations_tickets');


router.route('/').post(create_ticket);
router.route('/ticket_assigned_users').post(create_ticket_users);
router.route('/tickets_page').post(all_tickets_tickets_page).get(all_tickets_tickets_page_qty);
router.route('/tickets_page_selective_tiks').post(tickets_selected_user_tickets_page);
router.route('/tickets_page_selective_tiks_qty').post(tickets_selected_user_tickets_page_qty);
router.route('/search_tickets_page').post(search_tickets_page).get(search_tickets_page_qty);
router.route('/search_tickets_page_selective_user').post(search_tiks_page_selected_user).get(search_tiks_page_selected_user_qty);
router.route('/search_tickets_page_selective_user_qty').post(search_tiks_page_selected_user_qty);
router.route('/:id').get(get_ticket).patch(update_ticket).delete(delete_ticket);
router.route('/delete_ticket_users/:id').delete(delete_ticket_users);
router.route('/project_tickets/:id').get(get_projects_tickets);
router.route('/ticket_status_qty/:id').get(ticket_by_status_qty);
router.route('/ticket_type_qty/:id').get(ticket_by_type_qty);
router.route('/ticket_priority_qty/:id').get(ticket_by_priority_qty);
router.route('/search_tickets_proj_details/:id').get(search_tickets_proj_details);
router.route('/search_tickets_proj_details_qty/:id').get(search_tickets_proj_details_qty);

module.exports = router;