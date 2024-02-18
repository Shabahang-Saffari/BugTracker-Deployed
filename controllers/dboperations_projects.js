// const config = require('../db/dbconfig');
const sql = require('mssql');
const lodash = require('lodash');
// const {connect_db} = require('../db/connect');


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


// *********************************************
// ****** Get the number of All projects *******
// *********************************************
const number_of_all_projects = async (req, res) =>{
  
  const pool = await sql.connect(db_config);
  let projects = await pool.request()

  .query("Select count(*) AS projects_qty from Project");
  res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  
}
// *******************************************************
// ** Get All Projects Dashboard for Admin (In Progress)**
// *******************************************************
const get_all_projects = async (req, res) =>{
  
  const {page_number, num_per_page} = req.query;
  const my_offset = ((page_number - 1) * num_per_page);
  
  const pool = await sql.connect(db_config);
  let projects = await pool.request()
  .input('my_offset', sql.Int, my_offset)
  .input('num_per_page', sql.Int, num_per_page)
  .query("Select SUBQUERY.project_ID, SUBQUERY.project_name, SUBQUERY.project_desc, STRING_AGG(SUBQUERY.Contributors, ' | ') AS contributors From (Select Project.project_id AS project_ID, Project.project_name AS project_name, Project.project_desc AS project_desc, [User].user_fname +' '+ [User].user_lname AS Contributors from Project JOIN Project_User PU on PU.project_id = Project.project_id JOIN [User] on [User].user_id = PU.user_id Where Project.project_status_id =1) AS SUBQUERY Group By SUBQUERY.project_ID, SUBQUERY.project_name, SUBQUERY.project_desc Order By project_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");
  // ** using flattenDeep to collapse the nested array that comes with the recordsets 
  // console.log(lodash.flattenDeep(projects.recordsets));
  res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  
}
// *********************************************************************
// ***** Get number of projects Dashboard for Admin (In Progress) ******
// *********************************************************************
const number_of_dashboard_projects = async (req, res) =>{
  
  const pool = await sql.connect(db_config);
  let projects = await pool.request()

  .query("Select count(*) AS projects_qty from Project Where project_status_id =1");
  res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
}
// *************************************************************
// ** Get All Selected User's Projects (Dashboard/ In Prog) ****
// *************************************************************
const all_prjs_selected_user_dash = async (req, res) =>{
  
  const {page_number, num_per_page} = req.query;
  const {
    user_id
  } = req.body;

  const my_offset = ((page_number - 1) * num_per_page);
  const user_id_string = '%' + user_id.toString() + '%';

  const pool = await sql.connect(db_config);
  let projects = await pool.request()
  .input('my_offset', sql.Int, my_offset)
  .input('num_per_page', sql.Int, num_per_page)
  .input('user_id', sql.Int, user_id)
  .input('user_id_string', sql.VarChar, user_id_string)
  .query("Select project_ID,\
                 project_name,\
                 project_desc,\
                 PS.project_status_desc,\
                 project_creator_id,\
                 (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ') \
                 From Project_User PU\
                 JOIN [User] on [User].user_id = PU.user_id\
                 WHERE Project.project_id = PU.project_id\
                 )AS contributors,\
                 (Select STRING_AGG([User].user_id, '|') \
                 From Project_User PU\
                 JOIN [User] on [User].user_id = PU.user_id\
                 WHERE Project.project_id = PU.project_id\
                 )AS contributors_IDs\
          From Project\
          JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
          WHERE Project.project_status_id = 1\
          AND\
          (\
            project_creator_id = @user_id \
            OR\
            (Select STRING_AGG([User].user_id, '|') \
            From Project_User PU\
            JOIN [User] on [User].user_id = PU.user_id\
            WHERE Project.project_id = PU.project_id\
            ) LIKE @user_id_string\
          )\
          Order By Project.project_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");

  res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  
}
// ************************************************************
// **  QTY All Selected User's Projects (Dashboard/ In Prog) **
// ************************************************************
const all_prjs_selected_user_dash_qty = async (req, res) =>{
  
  const {
    user_id
  } = req.body;
  const user_id_string = '%' + user_id.toString() + '%';

  const pool = await sql.connect(db_config);
  let projects = await pool.request()
  .input('user_id', sql.Int, user_id)
  .input('user_id_string', sql.VarChar, user_id_string)
  .query("Select project_ID,\
                 project_name,\
                 project_desc,\
                 PS.project_status_desc,\
                 project_creator_id,\
                 (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ') \
                 From Project_User PU\
                 JOIN [User] on [User].user_id = PU.user_id\
                 WHERE Project.project_id = PU.project_id\
                 )AS contributors,\
                 (Select STRING_AGG([User].user_id, '|') \
                 From Project_User PU\
                 JOIN [User] on [User].user_id = PU.user_id\
                 WHERE Project.project_id = PU.project_id\
                 )AS contributors_IDs\
          From Project\
          JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
          WHERE Project.project_status_id = 1\
          AND\
          (\
            project_creator_id = @user_id \
            OR\
            (Select STRING_AGG([User].user_id, '|') \
            From Project_User PU\
            JOIN [User] on [User].user_id = PU.user_id\
            WHERE Project.project_id = PU.project_id\
            ) LIKE @user_id_string\
          )");

  res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  
}
// *************************************************
// ** Get All Projects for Admin (Project Page) ****
// *************************************************
const get_all_projects_proj_page = async (req, res) =>{
  
  const {page_number, num_per_page} = req.query;
  const my_offset = ((page_number - 1) * num_per_page);
  const pool = await sql.connect(db_config);
  let projects = await pool.request()
  .input('my_offset', sql.Int, my_offset)
  .input('num_per_page', sql.Int, num_per_page)
  .query("Select SUBQUERY.project_ID, SUBQUERY.project_name, SUBQUERY.project_desc, STRING_AGG(SUBQUERY.Contributors, ' | ') AS contributors, SUBQUERY.project_status_desc From (Select Project.project_id AS project_ID, Project.project_name AS project_name, Project.project_desc AS project_desc, [User].user_fname +' '+ [User].user_lname AS Contributors, PS.project_status_desc AS project_status_desc from Project JOIN Project_User PU on PU.project_id = Project.project_id JOIN [User] on [User].user_id = PU.user_id JOIN Project_Status PS on Project.project_status_id = PS.project_status_id) AS SUBQUERY Group By SUBQUERY.project_ID, SUBQUERY.project_name, SUBQUERY.project_desc, SUBQUERY.project_status_desc Order By project_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");

  res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  
}
// *******************************************************
// ** Get All Selected User's Projects (Project Page) ****
// *******************************************************
const all_prjs_selected_user_proj_page = async (req, res) =>{
  
  const {page_number, num_per_page} = req.query;
  const {
    user_id
  } = req.body;

  const user_id_string = '%' + user_id.toString() + '%';
  const my_offset = ((page_number - 1) * num_per_page);

  const pool = await sql.connect(db_config);
  let projects = await pool.request()
  .input('my_offset', sql.Int, my_offset)
  .input('num_per_page', sql.Int, num_per_page)
  .input('user_id', sql.Int, user_id)
  .input('user_id_string', sql.VarChar, user_id_string)
  .query("Select project_ID,\
                 project_name,\
                 project_desc,\
                 PS.project_status_desc,\
                 project_creator_id,\
                 (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ') \
                 From Project_User PU\
                 JOIN [User] on [User].user_id = PU.user_id\
                 Where Project.project_id = PU.project_id\
                 )AS contributors,\
                 (Select STRING_AGG([User].user_id, '|') \
                 From Project_User PU\
                 JOIN [User] on [User].user_id = PU.user_id\
                 WHERE Project.project_id = PU.project_id\
                 )AS contributors_IDs\
          From Project\
          JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
          WHERE  project_creator_id = @user_id \
          OR\
	        (Select STRING_AGG([User].user_id, '|') \
	        From Project_User PU\
		      JOIN [User] on [User].user_id = PU.user_id\
		      WHERE Project.project_id = PU.project_id\
		      ) LIKE @user_id_string\
          Order By Project.project_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");

  res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  
}
// *****************************************************
// ** QTY All Selected User's Projects (Project Page) **
// *****************************************************
const all_prjs_selected_user_proj_page_qty = async (req, res) =>{
  
  const {page_number, num_per_page} = req.query;
  const {
    user_id
  } = req.body;

  const user_id_string = '%' + user_id.toString() + '%';
  const my_offset = ((page_number - 1) * num_per_page);

  const pool = await sql.connect(db_config);
  let projects = await pool.request()
  .input('my_offset', sql.Int, my_offset)
  .input('num_per_page', sql.Int, num_per_page)
  .input('user_id', sql.Int, user_id)
  .input('user_id_string', sql.VarChar, user_id_string)
  .query("Select project_ID,\
                 project_name,\
                 project_desc,\
                 PS.project_status_desc,\
                 project_creator_id,\
                 (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ') \
                 From Project_User PU\
                 JOIN [User] on [User].user_id = PU.user_id\
                 Where Project.project_id = PU.project_id\
                 )AS contributors,\
                 (Select STRING_AGG([User].user_id, '|') \
                 From Project_User PU\
                 JOIN [User] on [User].user_id = PU.user_id\
                 WHERE Project.project_id = PU.project_id\
                 )AS contributors_IDs\
          From Project\
          JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
          WHERE  project_creator_id = @user_id \
          OR\
	        (Select STRING_AGG([User].user_id, '|') \
	        From Project_User PU\
		      JOIN [User] on [User].user_id = PU.user_id\
		      WHERE Project.project_id = PU.project_id\
		      ) LIKE @user_id_string");

  res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  
}
// **************************************
// ******** Get Single Project **********
// **************************************
const get_project = async (req, res) =>{

  const {id:project_id} = req.params;
  const pool = await sql.connect(db_config);
  let project = await pool.request()
  .input('project_id', sql.Int, project_id)
  .query("Select SUBQUERY.project_ID, SUBQUERY.project_name, SUBQUERY.project_desc, STRING_AGG(SUBQUERY.Contributors, ' | ') AS contributors, SUBQUERY.project_status_desc From (Select Project.project_id AS project_ID, Project.project_name AS project_name, Project.project_desc AS project_desc, [User].user_fname +' '+ [User].user_lname AS Contributors, PS.project_status_desc AS project_status_desc from Project JOIN Project_User PU on PU.project_id = Project.project_id JOIN [User] on [User].user_id = PU.user_id JOIN Project_Status PS on Project.project_status_id = PS.project_status_id) AS SUBQUERY Where SUBQUERY.project_ID = @project_id Group By SUBQUERY.project_ID, SUBQUERY.project_name, SUBQUERY.project_desc, SUBQUERY.project_status_desc");
  project = lodash.flattenDeep(project.recordsets)
  if(!project.length){
    throw new NotFound(`There is no project with the id: ${project_id}`);
  }
  res.status(StatusCodes.OK).json(project); 
}
// **************************************
// *********** Create Project ***********
// **************************************
const create_project = async (req, res) =>{
  const {
    new_project_name,
    new_project_desc,
    new_project_status_id,
    new_project_creator_id,
    new_project_creating_date,
    new_project_creating_time,
  } = req.body;
  const pool = await sql.connect(db_config);
  let new_project = await pool.request()
  .input('project_name', sql.VarChar, new_project_name)
  .input('project_desc', sql.VarChar, new_project_desc)
  .input('project_status_id', sql.Int, new_project_status_id)
  .input('project_creator_id', sql.Int, new_project_creator_id)
  .input('project_creating_date', sql.Date, new_project_creating_date)
  .input('project_creating_time', sql.VarChar, new_project_creating_time)
  .query("Insert into Project (project_name, project_desc, project_status_id, project_creator_id, project_creating_date, project_creating_time) Values (@project_name, @project_desc, @project_status_id, @project_creator_id, @project_creating_date, CONVERT(time, @project_creating_time)) Select SCOPE_IDENTITY() AS new_project_id");

  res.status(StatusCodes.OK).json(lodash.flattenDeep(new_project.recordsets));
  
}
// **************************************
// ******** Create Project Users ********
// **************************************
const create_project_users = async (req, res) =>{
  const {id:project_id} = req.params;
  const {
    user_id
  } = req.body;
  const pool = await sql.connect(db_config);
  let new_project_users = await pool.request()
  .input('project_id', sql.Int, project_id)
  .input('user_id', sql.Int, user_id)
  .query("Insert into Project_User (project_id, user_id) Values (@project_id, @user_id)");
  
  res.status(StatusCodes.OK).json();
}
// **************************************
// *********** Update Project ***********
// **************************************
const update_project = async (req, res) =>{
  const {id:project_id} = req.params;
  const {
    project_name,
    project_desc,
    project_status_id,
  } = req.body;
  const pool = await sql.connect(db_config);
  let updated_project = await pool.request()
  .input('project_id', sql.Int, project_id)
  .input('project_name', sql.VarChar, project_name)
  .input('project_desc', sql.VarChar, project_desc)
  .input('project_status_id', sql.Int, project_status_id)
  .query('Update Project set project_name= @project_name, project_desc= @project_desc, project_status_id = @project_status_id Where project_id= @project_id Select * from Project where project_id= @project_id');
  updated_project = lodash.flattenDeep(updated_project.recordsets);
  if(!updated_project.length){
    throw new NotFound(`There is no project with the id: ${project_id}`);
  }
  res.status(StatusCodes.OK).json(updated_project);

}
// **************************************
// *********** Delete Project ***********
// **************************************
const delete_project = async (req, res) =>{
  
  const {id:project_id} = req.params;
  const pool = await sql.connect(db_config);
  let deleted_project = await pool.request()
  .input('project_id', sql.Int, project_id)
  .query('Delete from Comment Where project_id = @project_id\
  Delete from Ticket_Assigned_User Where project_id = @project_id\
  Delete from Ticket Where ticket_project_id = @project_id\
  Delete from Project_User Where project_id = @project_id\
  Delete from Project where project_id = @project_id');
  if(deleted_project.rowsAffected[4] < 1){
    throw new NotFound(`There is no project with the id: ${project_id}`);
  }
  res.status(StatusCodes.OK).json();
}
// **************************************
// ******* Delete Project's Useres ******
// **************************************
const delete_project_users = async (req, res) =>{
  const {id:project_id} = req.params;
  const pool = await sql.connect(db_config);
  let deleted_proj_users = await pool.request()
  .input('project_id', sql.Int, project_id)
  .query('Delete from Project_User Where project_id = @project_id');
  if(deleted_proj_users.rowsAffected[0] < 1){
    throw new NotFound(`There is no project with the id: ${project_id}`);
  }
  res.status(StatusCodes.OK).json();
}
// ************************************************
// ****** Search Bar in Dashboard for Admin *******
// ************************************************
const search_project = async (req, res)=>{
  const {
    page_number,
    num_per_page,
    search_word
  } = req.query;
  const my_offset = ((page_number - 1) * num_per_page);
  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");
    const pool = await sql.connect(db_config);
    let project = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('my_offset', sql.Int, my_offset)
    .input('num_per_page', sql.Int, num_per_page)
    .query("Select \
     project_ID, project_name, project_desc, PS.project_status_desc,\
	   (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ')\
	      From Project_User PU\
		    JOIN [User] on [User].user_id = PU.user_id\
		    Where Project.project_id = PU.project_id\
		    )AS contributors\
    From Project\
    JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
    Where Project.project_status_id = 1\
    AND\
    (\
      LOWER(project_ID) LIKE @decoded_search_word\
      OR LOWER(project_name) LIKE @decoded_search_word\
      OR LOWER(project_desc) LIKE @decoded_search_word\
      OR (\
          Select STRING_AGG(LOWER([User].user_fname + ' ' + [User].user_lname), ' | ') \
          From Project_User PU\
          JOIN [User] on [User].user_id = PU.user_id\
          Where Project.project_id = PU.project_id\
        ) LIKE @decoded_search_word\
    )\
    Order By Project.project_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");
    
    project = lodash.flattenDeep(project.recordsets)
    if(!project.length){
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(project);
  }
}
// **********************************************
// ** Search Bar in Dashboard For Admin (QTY) ***
// **********************************************
const search_project_qty = async (req, res)=>{
  const {
    search_word
  } = req.query;
  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");
    const pool = await sql.connect(db_config);
    let project = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .query("Select \
     project_ID, project_name, project_desc, PS.project_status_desc,\
     (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ')\
        From Project_User PU\
        JOIN [User] on [User].user_id = PU.user_id\
        Where Project.project_id = PU.project_id\
        )AS contributors\
    From Project\
    JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
    Where Project.project_status_id = 1\
    AND\
    (\
      LOWER(project_ID) LIKE @decoded_search_word\
      OR LOWER(project_name) LIKE @decoded_search_word\
      OR LOWER(project_desc) LIKE @decoded_search_word\
      OR (\
          Select STRING_AGG(LOWER([User].user_fname + ' ' + [User].user_lname), ' | ') \
          From Project_User PU\
          JOIN [User] on [User].user_id = PU.user_id\
          Where Project.project_id = PU.project_id\
        ) LIKE @decoded_search_word\
    )\
    ");

    project = lodash.flattenDeep(project.recordsets)
    if(!project.length){
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(project);
  }
}
// *************************************************************
// ** Search Bar in Dashboard for Selective user's Projects ****
// *************************************************************
const search_prjs_selected_user_dash = async (req, res) =>{
  
  const {
    page_number,
    num_per_page,
    search_word
  } = req.query;

  const {
    user_id
  } = req.body;

  const my_offset = ((page_number - 1) * num_per_page);
  const user_id_string = '%' + user_id.toString() + '%';

  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");

    const pool = await sql.connect(db_config);
    let projects = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('my_offset', sql.Int, my_offset)
    .input('num_per_page', sql.Int, num_per_page)
    .input('user_id', sql.Int, user_id)
    .input('user_id_string', sql.VarChar, user_id_string)
    .query("Select \
     project_ID, project_name, project_desc, PS.project_status_desc, project_creator_id,\
	   (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ')\
	      From Project_User PU\
		    JOIN [User] on [User].user_id = PU.user_id\
		    Where Project.project_id = PU.project_id\
		    )AS contributors,\
        (Select STRING_AGG([User].user_id, ' | ') \
          From Project_User PU\
          JOIN [User] on [User].user_id = PU.user_id\
          WHERE Project.project_id = PU.project_id\
          )AS contributors_IDs\
    From Project\
    JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
    Where (Project.project_status_id = 1 AND (project_creator_id = @user_id OR (Select STRING_AGG([User].user_id, ' | ') \
    From Project_User PU\
    JOIN [User] on [User].user_id = PU.user_id\
    WHERE Project.project_id = PU.project_id\
    ) LIKE @user_id_string))\
      AND\
      (\
        project_ID LIKE @decoded_search_word\
        OR LOWER(project_name) LIKE @decoded_search_word\
        OR LOWER(project_desc) LIKE @decoded_search_word\
        OR (\
            Select STRING_AGG(LOWER([User].user_fname + ' ' + [User].user_lname), ' | ') \
            From Project_User PU\
            JOIN [User] on [User].user_id = PU.user_id\
            Where Project.project_id = PU.project_id\
          ) LIKE @decoded_search_word\
      )\
      Order By Project.project_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");
    res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  }
}
// ************************************************************
// *** Search Bar in Dashboard for Selective user's Prjs QTY ***
// *************************************************************
const search_prjs_selected_user_dash_qty = async (req, res) =>{
  
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
    let projects = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('user_id', sql.Int, user_id)
    .input('user_id_string', sql.VarChar, user_id_string)
    .query("Select \
     project_ID, project_name, project_desc, PS.project_status_desc, project_creator_id,\
	   (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ')\
	      From Project_User PU\
		    JOIN [User] on [User].user_id = PU.user_id\
		    Where Project.project_id = PU.project_id\
		    )AS contributors,\
        (Select STRING_AGG([User].user_id, ' | ') \
          From Project_User PU\
          JOIN [User] on [User].user_id = PU.user_id\
          WHERE Project.project_id = PU.project_id\
          )AS contributors_IDs\
      From Project\
      JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
      Where (Project.project_status_id = 1 AND (project_creator_id = @user_id OR (Select STRING_AGG([User].user_id, ' | ') \
      From Project_User PU\
      JOIN [User] on [User].user_id = PU.user_id\
      WHERE Project.project_id = PU.project_id\
      ) LIKE @user_id_string))\
    AND\
    (\
      project_ID LIKE @decoded_search_word\
      OR LOWER(project_name) LIKE @decoded_search_word\
      OR LOWER(project_desc) LIKE @decoded_search_word\
      OR (\
          Select STRING_AGG(LOWER([User].user_fname + ' ' + [User].user_lname), ' | ') \
          From Project_User PU\
          JOIN [User] on [User].user_id = PU.user_id\
          Where Project.project_id = PU.project_id\
        ) LIKE @decoded_search_word\
    )");
  res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  }
  
}
// ***********************************************
// **** Search Bar in Project Page for Admin *****
// ***********************************************
const search_project_page = async (req, res)=>{
  const {
    page_number,
    num_per_page,
    search_word
  } = req.query;

  const my_offset = ((page_number - 1) * num_per_page);

  if(search_word){

    const decoded_search_word = search_word.replace(/%20/g, " ");

    const pool = await sql.connect(db_config);
    let project = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('my_offset', sql.Int, my_offset)
    .input('num_per_page', sql.Int, num_per_page)
    .query("Select \
     project_ID, project_name, project_desc, PS.project_status_desc,\
	   (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ')\
	      From Project_User PU\
		    JOIN [User] on [User].user_id = PU.user_id\
		    Where Project.project_id = PU.project_id\
		    )AS contributors\
    From Project\
    JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
    Where \
      project_ID LIKE @decoded_search_word\
      OR LOWER(project_name) LIKE @decoded_search_word\
      OR LOWER(project_desc) LIKE @decoded_search_word\
      OR LOWER(PS.project_status_desc) LIKE @decoded_search_word\
      OR (\
          Select STRING_AGG(LOWER([User].user_fname + ' ' + [User].user_lname), ' | ') \
          From Project_User PU\
          JOIN [User] on [User].user_id = PU.user_id\
          Where Project.project_id = PU.project_id\
        ) LIKE @decoded_search_word\
    Order By Project.project_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");
    
    project = lodash.flattenDeep(project.recordsets)
    if(!project.length){
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(project);
  }
}
// **************************************************
// **** Search Bar in Project Page Admin (qty) ******
// **************************************************
const search_project_page_qty = async (req, res)=>{
  const {
    page_number,
    num_per_page,
    search_word
  } = req.query;

  const my_offset = ((page_number - 1) * num_per_page);

  if(search_word){

    const decoded_search_word = search_word.replace(/%20/g, " ");

    const pool = await sql.connect(db_config);
    let project = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('my_offset', sql.Int, my_offset)
    .input('num_per_page', sql.Int, num_per_page)
    .query("Select \
     project_ID, project_name, project_desc, PS.project_status_desc,\
	   (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ')\
	      From Project_User PU\
		    JOIN [User] on [User].user_id = PU.user_id\
		    Where Project.project_id = PU.project_id\
		    )AS contributors\
    From Project\
    JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
    Where \
      project_ID LIKE @decoded_search_word\
      OR LOWER(project_name) LIKE @decoded_search_word\
      OR LOWER(project_desc) LIKE @decoded_search_word\
      OR LOWER(PS.project_status_desc) LIKE @decoded_search_word\
      OR (\
          Select STRING_AGG(LOWER([User].user_fname + ' ' + [User].user_lname), ' | ') \
          From Project_User PU\
          JOIN [User] on [User].user_id = PU.user_id\
          Where Project.project_id = PU.project_id\
        ) LIKE @decoded_search_word");
    
    project = lodash.flattenDeep(project.recordsets)
    if(!project.length){
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(project);
  }
}
// ****************************************************************
// **** Search Bar in Project Page - Selected User's projects *****
// ****************************************************************
const search_prjs_page_selected_user = async (req, res)=>{
  const {
    page_number,
    num_per_page,
    search_word
  } = req.query;

  const {
    user_id
  } = req.body;

  const my_offset = ((page_number - 1) * num_per_page);
  const user_id_string = '%' + user_id.toString() + '%';

  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");

    const pool = await sql.connect(db_config);
    let projects = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('my_offset', sql.Int, my_offset)
    .input('num_per_page', sql.Int, num_per_page)
    .input('user_id', sql.Int, user_id)
    .input('user_id_string', sql.VarChar, user_id_string)
    .query("Select \
     project_ID, project_name, project_desc, PS.project_status_desc, project_creator_id,\
	   (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ')\
	      From Project_User PU\
		    JOIN [User] on [User].user_id = PU.user_id\
		    Where Project.project_id = PU.project_id\
		    )AS contributors,\
        (Select STRING_AGG([User].user_id, ' | ') \
          From Project_User PU\
          JOIN [User] on [User].user_id = PU.user_id\
          WHERE Project.project_id = PU.project_id\
          )AS contributors_IDs\
    From Project\
    JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
    Where (project_creator_id = @user_id OR (Select STRING_AGG([User].user_id, ' | ') \
    From Project_User PU\
    JOIN [User] on [User].user_id = PU.user_id\
    WHERE Project.project_id = PU.project_id\
    ) LIKE @user_id_string)\
      AND\
      (\
        project_ID LIKE @decoded_search_word\
        OR LOWER(project_name) LIKE @decoded_search_word\
        OR LOWER(project_desc) LIKE @decoded_search_word\
        OR LOWER(PS.project_status_desc) LIKE @decoded_search_word\
        OR (\
            Select STRING_AGG(LOWER([User].user_fname + ' ' + [User].user_lname), ' | ') \
            From Project_User PU\
            JOIN [User] on [User].user_id = PU.user_id\
            Where Project.project_id = PU.project_id\
          ) LIKE @decoded_search_word\
      )\
      Order By Project.project_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY");
    res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  }
}
// ****************************************************
// ** Search Bar in Project Page Selected User (qty) **
// ****************************************************
const search_prjs_page_selected_user_qty = async (req, res)=>{
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
    let projects = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .input('user_id', sql.Int, user_id)
    .input('user_id_string', sql.VarChar, user_id_string)
    .query("Select \
     project_ID, project_name, project_desc, PS.project_status_desc, project_creator_id,\
	   (Select STRING_AGG([User].user_fname + ' ' + [User].user_lname, ' | ')\
	      From Project_User PU\
		    JOIN [User] on [User].user_id = PU.user_id\
		    Where Project.project_id = PU.project_id\
		    )AS contributors,\
        (Select STRING_AGG([User].user_id, ' | ') \
          From Project_User PU\
          JOIN [User] on [User].user_id = PU.user_id\
          WHERE Project.project_id = PU.project_id\
          )AS contributors_IDs\
    From Project\
    JOIN Project_Status PS on Project.project_status_id = PS.project_status_id\
    Where (project_creator_id = @user_id OR (Select STRING_AGG([User].user_id, ' | ') \
    From Project_User PU\
    JOIN [User] on [User].user_id = PU.user_id\
    WHERE Project.project_id = PU.project_id\
    ) LIKE @user_id_string)\
      AND\
      (\
        project_ID LIKE @decoded_search_word\
        OR LOWER(project_name) LIKE @decoded_search_word\
        OR LOWER(project_desc) LIKE @decoded_search_word\
        OR LOWER(PS.project_status_desc) LIKE @decoded_search_word\
        OR (\
            Select STRING_AGG(LOWER([User].user_fname + ' ' + [User].user_lname), ' | ') \
            From Project_User PU\
            JOIN [User] on [User].user_id = PU.user_id\
            Where Project.project_id = PU.project_id\
          ) LIKE @decoded_search_word\
      )");
    res.status(StatusCodes.OK).json(lodash.flattenDeep(projects.recordsets));
  }
}

module.exports = {
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

} 