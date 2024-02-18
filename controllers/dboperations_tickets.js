const sql = require('mssql');
const lodash = require('lodash');

const {StatusCodes} = require('http-status-codes');
const {NotFound} = require('../errors');

const db_config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_Database,
  options:{
      trustedconnection: true,
      trustServerCertificate: true,
      encrypt: true,
      enablearithAort: true,
      instancename: 'DESKTOP-J01LV4J'
  },
  port: parseInt(process.env.DB_PORT)
}


// **************************************
// ******** Get Single ticket **********
// **************************************
const get_ticket = async (req, res) =>{

    const {id:ticket_id} = req.params;
    const pool = await sql.connect(db_config);
    let ticket = await pool.request()
    .input('ticket_id', sql.Int, ticket_id)
    .query("Select ticket_id,\
            ticket_name,\
            P.project_name,\
            ticket_project_id,\
            ticket_description,\
            ticket_submitter_id,\
            TT.ticket_type_desc,\
            TS.ticket_status_desc,\
            TP.ticket_priority_desc,\
            ticket_creation_date,\
            ticket_creation_time,\
            (\
              SELECT STRING_AGG(U.user_fname + ' ' + U.user_lname, ' | ')\
              FROM Ticket_Assigned_User TAU\
              JOIN [User] U ON U.user_id = TAU.user_id\
              WHERE TAU.ticket_id = T.ticket_id\
            ) AS assigned_users\
            From Ticket T\
            Join Project P on P.project_id = T.ticket_project_id\
            Join Ticket_Type TT on TT.ticket_type_id = T.ticket_type_id\
            Join Ticket_Priority TP on TP.ticket_priority_id = T.ticket_priority_id\
            Join Ticket_Status TS on TS.ticket_status_id = T.ticket_status_id\
            Where T.ticket_id = @ticket_id");
    ticket = lodash.flattenDeep(ticket.recordsets)
    if(!ticket.length){
      throw new NotFound(`There is no ticket with the id: ${ticket_id}`);
    }
    res.status(StatusCodes.OK).json(ticket);
  
}
// **************************************
// ******* Get Project's Tickets ********
// **************************************
const get_projects_tickets = async (req, res) =>{

  const {id:project_id} = req.params;
  const {
    page_number,
    num_per_page,
  } = req.query;
  const my_offset = ((page_number - 1) * num_per_page);

  const pool = await sql.connect(db_config);
  let tickets = await pool.request()
  .input('project_id', sql.Int, project_id)
  .input('my_offset', sql.Int, my_offset)
  .input('num_per_page', sql.Int, num_per_page)
  .query("Select T.ticket_id, T.ticket_name, U.user_fname + ' ' + U.user_lname as ticket_submitter, TS.ticket_status_desc, T.ticket_creation_date, T.ticket_creation_time,(SELECT STRING_AGG(U.user_fname + ' ' + U.user_lname, ' | ')FROM Ticket_Assigned_User TAU JOIN [User] U ON U.user_id = TAU.user_id WHERE TAU.ticket_id = T.ticket_id AND TAU.project_id = @project_id) AS assigned_users from Ticket T Join Ticket_Status TS on TS.ticket_status_id = T.ticket_status_id JOIN [User] U ON U.user_id = T.ticket_submitter_id Where T.ticket_project_id = @project_id Order By T.ticket_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY Select COUNT(ticket_id) all_tickets_qty from Ticket Where Ticket.ticket_project_id = @project_id");
  // tickets = lodash.flattenDeep(tickets.recordsets)
  tickets = tickets.recordsets;
  if(!tickets.length){
    throw new NotFound(`There is no ticket with this project id: ${project_id}`);
  }
  res.status(StatusCodes.OK).json(tickets);

}
// **************************************
// *********** Create ticket ***********
// **************************************
const create_ticket = async (req, res) =>{
  
  const {
    ticket_name,
    ticket_project_id,
    ticket_description,
    ticket_type_id,
    ticket_priority_id,
    ticket_status_id,
    ticket_submitter_id,
    ticket_creation_date,
    ticket_creation_time
  } = req.body;
  const pool = await sql.connect(db_config);
  let new_ticket = await pool.request()
  .input('ticket_name', sql.VarChar, ticket_name)
  .input('ticket_project_id', sql.Int, ticket_project_id)
  .input('ticket_description', sql.VarChar, ticket_description)
  .input('ticket_type_id', sql.Int, ticket_type_id)
  .input('ticket_priority_id', sql.Int, ticket_priority_id)
  .input('ticket_status_id', sql.Int, ticket_status_id)
  .input('ticket_submitter_id', sql.Int, ticket_submitter_id)
  .input('ticket_creation_date', sql.Date, ticket_creation_date)
  .input('ticket_creation_time', sql.VarChar, ticket_creation_time)
  .query("Insert into Ticket (ticket_name, ticket_project_id, ticket_description, ticket_type_id, ticket_priority_id, ticket_status_id, ticket_submitter_id, ticket_creation_date, ticket_creation_time) Values (@ticket_name, @ticket_project_id, @ticket_description, @ticket_type_id, @ticket_priority_id, @ticket_status_id, @ticket_submitter_id, @ticket_creation_date, CONVERT(time, @ticket_creation_time))\
  Select SCOPE_IDENTITY() AS ticket_id");
  
  res.status(StatusCodes.OK).json(lodash.flattenDeep(new_ticket.recordsets));
  
}
// **************************************
// ******** Create Ticket Users ********
// **************************************
const create_ticket_users = async (req, res) =>{
  const {
    ticket_id,
    ticket_project_id:project_id,
    user_id
  } = req.body;
  const pool = await sql.connect(db_config);
  let new_ticket_users = await pool.request()
  .input('project_id', sql.Int, project_id)
  .input('ticket_id', sql.Int, ticket_id)
  .input('user_id', sql.Int, user_id)
  .query("Insert into Ticket_Assigned_User (ticket_id, user_id, project_id) Values (@ticket_id, @user_id, @project_id)");
  
  res.status(StatusCodes.OK).json();
}
// **************************************
// ******** Delete Ticket's Users *******
// **************************************
const delete_ticket_users = async (req, res) =>{
  const {
    id:ticket_id
  } = req.params;
  const pool = await sql.connect(db_config);
  let new_ticket_users = await pool.request()
  .input('ticket_id', sql.Int, ticket_id)
  .query("Delete From Ticket_Assigned_User WHERE ticket_id = @ticket_id");
  
  res.status(StatusCodes.OK).json();
}
// **************************************
// *********** Update ticket ***********
// **************************************
const update_ticket = async (req, res) =>{

  const {id:ticket_id} = req.params;
  const {
    ticket_name,
    ticket_project_id,
    ticket_description,
    ticket_type_id,
    ticket_priority_id,
    ticket_status_id
  } = req.body;
  const pool = await sql.connect(db_config);
  let updated_ticket = await pool.request()
  .input('ticket_id', sql.Int, ticket_id)
  .input('ticket_name', sql.VarChar, ticket_name)
  .input('ticket_project_id', sql.Int, ticket_project_id)
  .input('ticket_description', sql.VarChar, ticket_description)
  .input('ticket_type_id', sql.Int, ticket_type_id)
  .input('ticket_priority_id', sql.Int, ticket_priority_id)
  .input('ticket_status_id', sql.Int, ticket_status_id)
  .query('Update Ticket set ticket_name= @ticket_name, ticket_project_id= @ticket_project_id, ticket_description = @ticket_description, ticket_type_id= @ticket_type_id, ticket_priority_id= @ticket_priority_id, ticket_status_id= @ticket_status_id WHERE ticket_id= @ticket_id Select * from Ticket where ticket_id= @ticket_id');
  updated_ticket = lodash.flattenDeep(updated_ticket.recordsets);
  if(!updated_ticket.length){
    throw new NotFound(`There is no ticket with the id: ${ticket_id}`);
  }
  res.status(StatusCodes.OK).json(updated_ticket);

}
// **************************************
// *********** Delete Ticket ************
// **************************************
const delete_ticket = async (req, res) =>{

    const {id:ticket_id} = req.params;
    const pool = await sql.connect(db_config);
    let deleted_ticket = await pool.request()
    .input('ticket_id', sql.Int, ticket_id)
    .query('Delete from Comment Where ticket_id = @ticket_id\
    Delete from Ticket_Assigned_User Where ticket_id = @ticket_id\
    Delete from Ticket where ticket_id = @ticket_id');
    if(deleted_ticket.rowsAffected[2] < 1){
      throw new NotFound(`There is no ticket with the id: ${ticket_id}`);
    }
    res.status(StatusCodes.OK).json();
  
}
// **** Search Bar in Project Detils ****
// **************************************
const search_tickets_proj_details = async (req, res)=>{
  const {id:project_id} = req.params;
  const {
    search_word,
    page_number,
    num_per_page,
  } = req.query;
  const my_offset = ((page_number - 1) * num_per_page);
  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");

    const pool = await sql.connect(db_config);
    let tickets = await pool.request()
    .input('project_id', sql.Int, project_id)
    .input('my_offset', sql.Int, my_offset)
    .input('num_per_page', sql.Int, num_per_page)
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .query("Select\
      T.ticket_id, T.ticket_name, U.user_fname + ' ' + U.user_lname as ticket_submitter, TS.ticket_status_desc, T.ticket_creation_date, T.ticket_creation_time,\
      ( SELECT STRING_AGG(U.user_fname + ' ' + U.user_lname, ' | ') FROM Ticket_Assigned_User TAU \
      JOIN [User] U ON U.user_id = TAU.user_id WHERE TAU.ticket_id = T.ticket_id AND TAU.project_id = @project_id ) AS assigned_users from Ticket T \
      Join Ticket_Status TS on TS.ticket_status_id = T.ticket_status_id \
      JOIN [User] U ON U.user_id = T.ticket_submitter_id \
      Where T.ticket_project_id = @project_id \
      AND\
      (\
         T.ticket_id LIKE @decoded_search_word \
         OR LOWER(T.ticket_name) LIKE @decoded_search_word \
         OR (LOWER(U.user_fname) + ' ' + LOWER(U.user_lname)) LIKE @decoded_search_word \
         OR LOWER(TS.ticket_status_desc) LIKE @decoded_search_word \
         OR T.ticket_creation_date LIKE @decoded_search_word \
         OR T.ticket_creation_time LIKE @decoded_search_word \
         OR \
         ( SELECT STRING_AGG(LOWER(U.user_fname) + ' ' + LOWER(U.user_lname), ' | ') FROM Ticket_Assigned_User TAU JOIN [User] U ON U.user_id = TAU.user_id WHERE TAU.ticket_id = T.ticket_id AND TAU.project_id = @project_id) LIKE @decoded_search_word\
      )\
      Order By T.ticket_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");
  
    tickets = lodash.flattenDeep(tickets.recordsets)
   
    if(!tickets.length){
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(tickets);
  }
}
// *****************************************
// ** Search Bar in Project Detils (QTY) ***
// *****************************************
const search_tickets_proj_details_qty = async (req, res)=>{
  const {id:project_id} = req.params;
  const {
    search_word,
    page_number,
    num_per_page,
  } = req.query;
  const my_offset = ((page_number - 1) * num_per_page);

  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");
    const pool = await sql.connect(db_config);
    let tickets = await pool.request()
    .input('project_id', sql.Int, project_id)
    .input('my_offset', sql.Int, my_offset)
    .input('num_per_page', sql.Int, num_per_page)
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .query("Select\
      T.ticket_id, T.ticket_name, U.user_fname + ' ' + U.user_lname as ticket_submitter, TS.ticket_status_desc, T.ticket_creation_date, T.ticket_creation_time,\
      ( SELECT STRING_AGG(U.user_fname + ' ' + U.user_lname, ' | ') FROM Ticket_Assigned_User TAU \
      JOIN [User] U ON U.user_id = TAU.user_id WHERE TAU.ticket_id = T.ticket_id AND TAU.project_id = @project_id ) AS assigned_users from Ticket T \
      Join Ticket_Status TS on TS.ticket_status_id = T.ticket_status_id \
      JOIN [User] U ON U.user_id = T.ticket_submitter_id \
      Where T.ticket_project_id = @project_id \
      AND\
      (\
         T.ticket_id LIKE @decoded_search_word \
         OR LOWER(T.ticket_name) LIKE @decoded_search_word \
         OR (LOWER(U.user_fname) + ' ' + LOWER(U.user_lname)) LIKE @decoded_search_word \
         OR LOWER(TS.ticket_status_desc) LIKE @decoded_search_word \
         OR T.ticket_creation_date LIKE @decoded_search_word \
         OR T.ticket_creation_time LIKE @decoded_search_word \
         OR \
         ( SELECT STRING_AGG(LOWER(U.user_fname) + ' ' + LOWER(U.user_lname), ' | ') FROM Ticket_Assigned_User TAU JOIN [User] U ON U.user_id = TAU.user_id WHERE TAU.ticket_id = T.ticket_id AND TAU.project_id = @project_id) LIKE @decoded_search_word\
      )");
  
    tickets = lodash.flattenDeep(tickets.recordsets)
   
    if(!tickets.length){
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(tickets);
  }
}
// ***********************************************
// **** All Tickets in Tickets Page for Admin ****
// ***********************************************
const all_tickets_tickets_page = async (req, res)=>{

  const {
    page_index:page_number,
    number_of_rows:num_per_page,
  } = req.body;

  const my_offset = ((page_number - 1) * num_per_page);

  const pool = await sql.connect(db_config);
  let tickets = await pool.request()
  .input('my_offset', sql.Int, my_offset)
  .input('num_per_page', sql.Int, num_per_page)
  .query("Select T.ticket_id,\
          T.ticket_name,\
          P.project_name,\
          U.user_fname + ' ' + U.user_lname AS ticket_submitter,\
          TT.ticket_type_desc,\
          TP.ticket_priority_desc,\
          TS.ticket_status_desc,\
          T.ticket_creation_date,\
          T.ticket_creation_time,\
          (\
            SELECT STRING_AGG(U.user_fname + ' ' + U.user_lname, ' | ')\
            FROM Ticket_Assigned_User TAU\
            JOIN [User] U ON U.user_id = TAU.user_id\
            WHERE TAU.ticket_id = T.ticket_id\
          ) AS assigned_users\
          From Ticket T\
          JOIN Ticket_Status TS ON TS.ticket_status_id = T.ticket_status_id\
          JOIN Ticket_Type TT ON TT.ticket_type_id = T.ticket_type_id\
          JOIN Ticket_Priority TP ON TP.ticket_priority_id = T.ticket_priority_id\
          JOIN [User] U ON U.user_id = T.ticket_submitter_id\
          JOIN Project P ON P.project_id = T.ticket_project_id\
          Order By T.ticket_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");

  tickets = lodash.flattenDeep(tickets.recordsets)
  
  if(!tickets.length){
    return res.status(StatusCodes.OK).send();
  }
  res.status(StatusCodes.OK).json(tickets);
  
}
// *****************************************************
// **** All Tickets in Tickets Page for Admin (QTY) ****
// *****************************************************
const all_tickets_tickets_page_qty = async (req, res)=>{

  const pool = await sql.connect(db_config);
  let tickets = await pool.request()
  .query("Select COUNT(ticket_id) AS all_tickets_qty From Ticket");

  tickets = lodash.flattenDeep(tickets.recordsets)
  
  if(!tickets.length){
    return res.status(StatusCodes.OK).send();
  }
  res.status(StatusCodes.OK).json(tickets);
}
// *******************************************************
// *** All Tickets for Selected User in Tickets Page  ****
// *******************************************************
const tickets_selected_user_tickets_page = async (req, res)=>{

  const {
    page_index:page_number,
    number_of_rows:num_per_page,
    user_id
  } = req.body;

  const my_offset = ((page_number - 1) * num_per_page);
  const user_id_string = '%' + user_id.toString() + '%';

  const pool = await sql.connect(db_config);
  let tickets = await pool.request()
  .input('my_offset', sql.Int, my_offset)
  .input('num_per_page', sql.Int, num_per_page)
  .input('user_id', sql.Int, user_id)
  .input('user_id_string', sql.VarChar, user_id_string)
  .query("Select T.ticket_id,\
          T.ticket_name,\
	        P.project_name,\
          U.user_fname + ' ' + U.user_lname as ticket_submitter,\
	        TT.ticket_type_desc,\
	        TP.ticket_priority_desc,\
          TS.ticket_status_desc,\
          T.ticket_creation_date,\
          T.ticket_creation_time,\
          (\
            SELECT STRING_AGG(U.user_fname + ' ' + U.user_lname, ' | ')\
            FROM Ticket_Assigned_User TAU\
            JOIN [User] U ON U.user_id = TAU.user_id\
            WHERE TAU.ticket_id = T.ticket_id\
          ) AS assigned_users,\
          (\
          SELECT STRING_AGG(U.user_id, ' | ')\
          FROM Ticket_Assigned_User TAU\
          JOIN [User] U ON U.user_id = TAU.user_id\
          WHERE TAU.ticket_id = T.ticket_id\
          ) AS assigned_users_IDs\
          from Ticket T\
          JOIN Ticket_Status TS ON TS.ticket_status_id = T.ticket_status_id\
          JOIN Ticket_Type TT ON TT.ticket_type_id = T.ticket_type_id\
          JOIN Ticket_Priority TP ON TP.ticket_priority_id = T.ticket_priority_id\
          JOIN [User] U ON U.user_id = T.ticket_submitter_id\
          JOIN Project P ON P.project_id = T.ticket_project_id\
          WHERE U.user_id = @user_id\
          OR \
          (\
            SELECT STRING_AGG(U.user_id, ' | ')\
            FROM Ticket_Assigned_User TAU\
            JOIN [User] U ON U.user_id = TAU.user_id\
            WHERE TAU.ticket_id = T.ticket_id\
          ) LIKE @user_id_string \
          Order By T.ticket_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");

  tickets = lodash.flattenDeep(tickets.recordsets)
  
  if(!tickets.length){
    return res.status(StatusCodes.OK).send();
  }
  res.status(StatusCodes.OK).json(tickets);
  
}
// *********************************************************
// ** All Tickets for Selected User in Tickets Page (QTY) **
// *********************************************************
const tickets_selected_user_tickets_page_qty = async (req, res)=>{

  const {
    user_id
  } = req.body;

  const user_id_string = '%' + user_id.toString() + '%';

  const pool = await sql.connect(db_config);
  let tickets = await pool.request()
  .input('user_id', sql.Int, user_id)
  .input('user_id_string', sql.VarChar, user_id_string)
  .query("Select T.ticket_id,\
          T.ticket_name,\
	        P.project_name,\
          U.user_fname + ' ' + U.user_lname as ticket_submitter,\
	        TT.ticket_type_desc,\
	        TP.ticket_priority_desc,\
          TS.ticket_status_desc,\
          T.ticket_creation_date,\
          T.ticket_creation_time,\
          (\
            SELECT STRING_AGG(U.user_fname + ' ' + U.user_lname, ' | ')\
            FROM Ticket_Assigned_User TAU\
            JOIN [User] U ON U.user_id = TAU.user_id\
            WHERE TAU.ticket_id = T.ticket_id\
          ) AS assigned_users,\
          (\
          SELECT STRING_AGG(U.user_id, ' | ')\
          FROM Ticket_Assigned_User TAU\
          JOIN [User] U ON U.user_id = TAU.user_id\
          WHERE TAU.ticket_id = T.ticket_id\
          ) AS assigned_users_IDs\
          from Ticket T\
          JOIN Ticket_Status TS ON TS.ticket_status_id = T.ticket_status_id\
          JOIN Ticket_Type TT ON TT.ticket_type_id = T.ticket_type_id\
          JOIN Ticket_Priority TP ON TP.ticket_priority_id = T.ticket_priority_id\
          JOIN [User] U ON U.user_id = T.ticket_submitter_id\
          JOIN Project P ON P.project_id = T.ticket_project_id\
          WHERE U.user_id = @user_id\
          OR \
          (\
            SELECT STRING_AGG(U.user_id, ' | ')\
            FROM Ticket_Assigned_User TAU\
            JOIN [User] U ON U.user_id = TAU.user_id\
            WHERE TAU.ticket_id = T.ticket_id\
          ) LIKE @user_id_string \
          ");

  tickets = lodash.flattenDeep(tickets.recordsets)
  
  if(!tickets.length){
    return res.status(StatusCodes.OK).send();
  }
  res.status(StatusCodes.OK).json(tickets);
}
// ******************************************
// ** Search Bar in Tickets Page for Admin **
// ******************************************
const search_tickets_page = async (req, res)=>{

  const {
    search_word
  } = req.query;

  const {
    page_index:page_number,
    number_of_rows:num_per_page
  } = req.body;

  const my_offset = ((page_number - 1) * num_per_page);

  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");
    const pool = await sql.connect(db_config);
    let tickets = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('my_offset', sql.Int, my_offset)
    .input('num_per_page', sql.Int, num_per_page)
    .query("Select T.ticket_id,\
            T.ticket_name,\
	          P.project_name,\
            TT.ticket_type_desc,\
	          TP.ticket_priority_desc,\
            TS.ticket_status_desc,\
            T.ticket_creation_date,\
            T.ticket_creation_time,\
            (\
            SELECT STRING_AGG(U.user_fname + ' ' + U.user_lname, ' | ')\
            FROM Ticket_Assigned_User TAU\
            JOIN [User] U ON U.user_id = TAU.user_id\
            WHERE TAU.ticket_id = T.ticket_id\
            )AS assigned_users\
            from Ticket T\
            Join Ticket_Status TS on TS.ticket_status_id = T.ticket_status_id\
            JOIN Ticket_Type TT ON TT.ticket_type_id = T.ticket_type_id\
            JOIN Ticket_Priority TP ON TP.ticket_priority_id = T.ticket_priority_id\
            JOIN Project P ON P.project_id = T.ticket_project_id\
            Where T.ticket_id LIKE @decoded_search_word\
            OR LOWER(T.ticket_name) LIKE @decoded_search_word\
            OR LOWER(P.project_name) LIKE @decoded_search_word\
            OR LOWER(TS.ticket_status_desc) LIKE @decoded_search_word\
            OR LOWER(TP.ticket_priority_desc) LIKE @decoded_search_word\
            OR LOWER(TT.ticket_type_desc) LIKE @decoded_search_word\
            OR T.ticket_creation_date LIKE @decoded_search_word\
            OR T.ticket_creation_time LIKE @decoded_search_word\
            OR (\
                SELECT STRING_AGG(LOWER(U.user_fname) + ' ' + LOWER(U.user_lname), ' | ')\
                FROM Ticket_Assigned_User TAU\
                JOIN [User] U ON U.user_id = TAU.user_id\
                WHERE TAU.ticket_id = T.ticket_id\
            ) LIKE @decoded_search_word\
            Order By T.ticket_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");
    res.status(StatusCodes.OK).json(lodash.flattenDeep(tickets.recordsets));
  }
}
// ************************************************
// ** Search Bar in Tickets Page for Admin (QTY) **
// ************************************************
const search_tickets_page_qty = async (req, res)=>{

  const {
    search_word
  } = req.query;

  const {
    page_number,
    num_per_page
  } = req.body;

  const my_offset = ((page_number - 1) * num_per_page);

  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");
    const pool = await sql.connect(db_config);
    let tickets = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('my_offset', sql.Int, my_offset)
    .input('num_per_page', sql.Int, num_per_page)
    .query("Select T.ticket_id,\
            T.ticket_name,\
	          P.project_name,\
            TT.ticket_type_desc,\
	          TP.ticket_priority_desc,\
            TS.ticket_status_desc,\
            T.ticket_creation_date,\
            T.ticket_creation_time,\
          (\
          SELECT STRING_AGG(U.user_fname + ' ' + U.user_lname, ' | ')\
          FROM Ticket_Assigned_User TAU\
          JOIN [User] U ON U.user_id = TAU.user_id\
          WHERE TAU.ticket_id = T.ticket_id\
          )AS assigned_users\
          from Ticket T\
          Join Ticket_Status TS on TS.ticket_status_id = T.ticket_status_id\
          JOIN Ticket_Type TT ON TT.ticket_type_id = T.ticket_type_id\
          JOIN Ticket_Priority TP ON TP.ticket_priority_id = T.ticket_priority_id\
          JOIN Project P ON P.project_id = T.ticket_project_id\
          Where T.ticket_id LIKE @decoded_search_word\
                OR LOWER(T.ticket_name) LIKE @decoded_search_word\
                OR LOWER(P.project_name) LIKE @decoded_search_word\
                OR LOWER(TS.ticket_status_desc) LIKE @decoded_search_word\
                OR LOWER(TP.ticket_priority_desc) LIKE @decoded_search_word\
                OR LOWER(TT.ticket_type_desc) LIKE @decoded_search_word\
                OR T.ticket_creation_date LIKE @decoded_search_word\
                OR T.ticket_creation_time LIKE @decoded_search_word\
                OR (\
                    SELECT STRING_AGG(LOWER(U.user_fname) + ' ' + LOWER(U.user_lname), ' | ')\
                    FROM Ticket_Assigned_User TAU\
                    JOIN [User] U ON U.user_id = TAU.user_id\
                    WHERE TAU.ticket_id = T.ticket_id\
                ) LIKE @decoded_search_word");
    res.status(StatusCodes.OK).json(lodash.flattenDeep(tickets.recordsets));
  }
}
// **********************************************
// ** Search Bar in Tickets Page Selected User **
// **********************************************
const search_tiks_page_selected_user = async (req, res)=>{

  const {
    search_word
  } = req.query;

  const {
    page_index:page_number,
    number_of_rows:num_per_page,
    user_id
  } = req.body;

  const user_id_string = '%' + user_id.toString() + '%';
  const my_offset = ((page_number - 1) * num_per_page);

  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");
    const pool = await sql.connect(db_config);
    let tickets = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('my_offset', sql.Int, my_offset)
    .input('num_per_page', sql.Int, num_per_page)
    .input('user_id', sql.Int, user_id)
    .input('user_id_string', sql.VarChar, user_id_string)
    .query("Select T.ticket_id,\
            T.ticket_name,\
	          P.project_name,\
            TT.ticket_type_desc,\
	          TP.ticket_priority_desc,\
            TS.ticket_status_desc,\
            T.ticket_creation_date,\
            T.ticket_creation_time,\
            (\
              SELECT STRING_AGG(LOWER(U.user_fname) + ' ' + LOWER(U.user_lname), ' | ')\
              FROM Ticket_Assigned_User TAU\
              JOIN [User] U ON U.user_id = TAU.user_id\
              WHERE TAU.ticket_id = T.ticket_id\
            ) AS assigned_users\
            from Ticket T\
            Join Ticket_Status TS on TS.ticket_status_id = T.ticket_status_id\
            JOIN Ticket_Type TT ON TT.ticket_type_id = T.ticket_type_id\
            JOIN Ticket_Priority TP ON TP.ticket_priority_id = T.ticket_priority_id\
            JOIN Project P ON P.project_id = T.ticket_project_id\
            Where \
            (T.ticket_submitter_id = @user_id\
            OR\
              (SELECT STRING_AGG(U.user_id, ' | ')\
              FROM Ticket_Assigned_User TAU\
              JOIN [User] U ON U.user_id = TAU.user_id\
              WHERE TAU.ticket_id = T.ticket_id) LIKE @user_id_string)\
            AND \
            (\
              T.ticket_id LIKE @decoded_search_word\
              OR LOWER(T.ticket_name) LIKE @decoded_search_word\
              OR LOWER(P.project_name) LIKE @decoded_search_word\
              OR LOWER(TS.ticket_status_desc) LIKE @decoded_search_word\
              OR LOWER(TP.ticket_priority_desc) LIKE @decoded_search_word\
              OR LOWER(TT.ticket_type_desc) LIKE @decoded_search_word\
              OR T.ticket_creation_date LIKE @decoded_search_word\
              OR T.ticket_creation_time LIKE @decoded_search_word\
              OR (\
                  SELECT STRING_AGG(LOWER(U.user_fname) + ' ' + LOWER(U.user_lname), ' | ')\
                  FROM Ticket_Assigned_User TAU\
                  JOIN [User] U ON U.user_id = TAU.user_id\
                  WHERE TAU.ticket_id = T.ticket_id\
              ) LIKE @decoded_search_word)\
            Order By T.ticket_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");
    res.status(StatusCodes.OK).json(lodash.flattenDeep(tickets.recordsets));
  }
}
// ****************************************************
// ** Search Bar in Tickets Page Selected User (QTY) **
// ****************************************************
const search_tiks_page_selected_user_qty = async (req, res)=>{

  const {
    search_word
  } = req.query;

  const {
    user_id
  } = req.body;

  const user_id_string = '%' + user_id.toString() + '%';

  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");
    const pool = await sql.connect(db_config);
    let tickets = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('user_id', sql.Int, user_id)
    .input('user_id_string', sql.VarChar, user_id_string)
    .query("Select T.ticket_id,\
            T.ticket_name,\
	          P.project_name,\
            TT.ticket_type_desc,\
	          TP.ticket_priority_desc,\
            TS.ticket_status_desc,\
            T.ticket_creation_date,\
            T.ticket_creation_time,\
            (\
              SELECT STRING_AGG(LOWER(U.user_fname) + ' ' + LOWER(U.user_lname), ' | ')\
              FROM Ticket_Assigned_User TAU\
              JOIN [User] U ON U.user_id = TAU.user_id\
              WHERE TAU.ticket_id = T.ticket_id\
            ) AS assigned_users\
            from Ticket T\
            Join Ticket_Status TS on TS.ticket_status_id = T.ticket_status_id\
            JOIN Ticket_Type TT ON TT.ticket_type_id = T.ticket_type_id\
            JOIN Ticket_Priority TP ON TP.ticket_priority_id = T.ticket_priority_id\
            JOIN Project P ON P.project_id = T.ticket_project_id\
            Where \
            (T.ticket_submitter_id = @user_id\
            OR\
              (SELECT STRING_AGG(U.user_id, ' | ')\
              FROM Ticket_Assigned_User TAU\
              JOIN [User] U ON U.user_id = TAU.user_id\
              WHERE TAU.ticket_id = T.ticket_id) LIKE @user_id_string)\
            AND \
            (\
              T.ticket_id LIKE @decoded_search_word\
              OR LOWER(T.ticket_name) LIKE @decoded_search_word\
              OR LOWER(P.project_name) LIKE @decoded_search_word\
              OR LOWER(TS.ticket_status_desc) LIKE @decoded_search_word\
              OR LOWER(TP.ticket_priority_desc) LIKE @decoded_search_word\
              OR LOWER(TT.ticket_type_desc) LIKE @decoded_search_word\
              OR T.ticket_creation_date LIKE @decoded_search_word\
              OR T.ticket_creation_time LIKE @decoded_search_word\
              OR (\
                  SELECT STRING_AGG(LOWER(U.user_fname) + ' ' + LOWER(U.user_lname), ' | ')\
                  FROM Ticket_Assigned_User TAU\
                  JOIN [User] U ON U.user_id = TAU.user_id\
                  WHERE TAU.ticket_id = T.ticket_id\
              ) LIKE @decoded_search_word)");
    res.status(StatusCodes.OK).json(lodash.flattenDeep(tickets.recordsets));
  }
}
// **************************************
// ******* Tickets By Status QTY ********
// **************************************
const ticket_by_status_qty = async (req, res)=>{
  const {id:user_id} = req.params;
  const pool = await sql.connect(db_config);
    let tickets_status_qty = await pool.request()
    .input('user_id', sql.VarChar, user_id)
    .query("Select TS.ticket_status_desc, COUNT(*) AS number from Ticket T JOIN Ticket_Assigned_User TAU ON TAU.ticket_id = T.ticket_id Join Ticket_Status TS ON TS.ticket_status_id = T.ticket_status_id Where TAU.user_id = @user_id Group By TS.ticket_status_desc");
  
    tickets_status_qty = lodash.flattenDeep(tickets_status_qty.recordsets);
    if(!tickets_status_qty.length){
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(tickets_status_qty);
}
// **************************************
// ******* Tickets By Type QTY ********
// **************************************
const ticket_by_type_qty = async (req, res)=>{
  const {id:user_id} = req.params;
  const pool = await sql.connect(db_config);
    let tickets_type_qty = await pool.request()
    .input('user_id', sql.VarChar, user_id)
    .query("Select TT.ticket_type_desc, COUNT(*) AS number from Ticket T JOIN Ticket_Assigned_User TAU ON TAU.ticket_id = T.ticket_id Join Ticket_Type TT ON TT.ticket_type_id = T.ticket_type_id Where TAU.user_id = @user_id Group By TT.ticket_type_desc");
    tickets_type_qty = lodash.flattenDeep(tickets_type_qty.recordsets);
   
    if(!tickets_type_qty.length){
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(tickets_type_qty);
}
// **************************************
// ****** Tickets By Priority QTY *******
// **************************************
const ticket_by_priority_qty = async (req, res)=>{
  const {id:user_id} = req.params;
  const pool = await sql.connect(db_config);
    let tickets_priority_qty = await pool.request()
    .input('user_id', sql.VarChar, user_id)
    .query("Select TP.ticket_priority_desc, COUNT(*) AS number from Ticket T JOIN Ticket_Assigned_User TAU ON TAU.ticket_id = T.ticket_id Join Ticket_Priority TP ON  TP.ticket_priority_id = T.ticket_priority_id Where TAU.user_id = @user_id Group By TP.ticket_priority_desc");
    tickets_priority_qty = lodash.flattenDeep(tickets_priority_qty.recordsets);
   
    if(!tickets_priority_qty.length){
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(tickets_priority_qty);
}

module.exports = {
  get_ticket,
  get_projects_tickets,
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
  delete_ticket_users,
  search_tickets_proj_details,
  search_tickets_proj_details_qty,
  search_tickets_page,
  search_tickets_page_qty,
  search_tiks_page_selected_user,
  search_tiks_page_selected_user_qty
} 