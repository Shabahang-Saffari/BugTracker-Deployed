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
// *********** Get All Users ************
// **************************************
const get_all_users = async (req, res) =>{
  
  const pool = await sql.connect(db_config);
  let users = await pool.request().query("Select U.user_id, U.user_fname + ' ' + U.user_lname AS [name], R.role_name FROM [User] U JOIN Role R ON R.role_id = U.user_role_id Order By U.user_lname");
  users = lodash.flattenDeep(users.recordsets);
  res.status(StatusCodes.OK).json(users);
  
}
// *****************************************
// ** Get All Users Assigned to a Project **
// *****************************************
const get_all_prj_assigned_users = async (req, res) =>{
  const {id:project_id} = req.params;

  const pool = await sql.connect(db_config);
  let users = await pool.request()
  .input('project_id', sql.Int, project_id)
  .query("Select U.user_id, U.user_fname + ' ' + U.user_lname AS [name] FROM [User] U JOIN Project_User PU ON PU.user_id = U.user_id\
  WHERE PU.project_id = @project_id Order By U.user_lname");
  users = lodash.flattenDeep(users.recordsets);
  res.status(StatusCodes.OK).json(users);
  
}
// **************************************
// ******** Get Single User **********
// **************************************
const get_user = async (req, res) =>{

  const {id:user_id} = req.params;
  const pool = await sql.connect(db_config);
  let user = await pool.request()
  .input('user_id', sql.Int, user_id)
  .query("Select U.user_id, U.user_fname, U.user_nick_name, U.user_lname, U.user_phone, U.user_email, U.user_pass, R.role_name, U.user_role_id, U.user_status_id from [User] U JOIN Role R ON R.role_id = U.user_role_id JOIN User_Status US ON US.user_status_id = U.user_status_id Where U.user_id = @user_id");
  user = lodash.flattenDeep(user.recordsets)
  if(!user.length){
    throw new NotFound(`There is no user with the id: ${user_id}`);
  }
  res.status(StatusCodes.OK).json(user);

}
// ******************************************
// **** Get Single User - Ticket Details *****
// *******************************************
const get_assigned_users_ticket = async (req, res) =>{

  const {id:ticket_id} = req.params;
  const pool = await sql.connect(db_config);
  let user = await pool.request()
  .input('ticket_id', sql.Int, ticket_id)
  .query("Select TAU.user_id, U.user_fname + ' ' + U.user_lname AS [name], U.user_email, R.role_name from Ticket_Assigned_User TAU JOIN [User] U ON U.user_id = TAU.user_id JOIN Role R ON R.role_id = U.user_role_id Where TAU.ticket_id = @ticket_id");
  user = lodash.flattenDeep(user.recordsets)
  if(!user.length){
    throw new NotFound(`There is no user with the id: ${user_id}`);
  }
  res.status(StatusCodes.OK).json(user);
  
}
// ******************************************
// ***** Get Prject Contributors info *******
// *******************************************
const get_prj_contributors_info = async (req, res) =>{

  const {id:project_id} = req.params;
  const pool = await sql.connect(db_config);
  let contributors = await pool.request()
  .input('project_id', sql.Int, project_id)
  .query("Select U.user_fname + ' ' + U.user_lname project_contributors, U.user_email, R.role_name from Project_User AS PU JOIN [User] AS U ON PU.user_id = U.user_id JOIN [Role] AS R ON U.user_role_id = R.role_id Where PU.project_id = @project_id");
  contributors = lodash.flattenDeep(contributors.recordsets)
  if(!contributors.length){
    throw new NotFound(`There is no project with the id: ${project_id}`);
  }
  res.status(StatusCodes.OK).json(contributors);
  
}
// **************************************
// ********** Create New User ***********
// **************************************
const create_user = async (req, res) =>{
  
  let {
    user_fname,
    user_lname,
    user_nick_name,
    user_phone,
    user_email,
    user_pass
  } = req.body;
  if(!user_nick_name){
    user_nick_name = user_fname;
  }
  const pool = await sql.connect(db_config);
  let new_user = await pool.request()
  .input('user_fname', sql.VarChar, user_fname)
  .input('user_lname', sql.VarChar, user_lname)
  .input('user_nick_name', sql.VarChar, user_nick_name)
  .input('user_phone', sql.Char, user_phone)
  .input('user_email', sql.VarChar, user_email)
  .input('user_pass', sql.VarChar, user_pass)
  .query("Insert into [User] (user_fname, user_lname, user_nick_name, user_phone, user_email, user_pass) Values (@user_fname, @user_lname, @user_nick_name, @user_phone, @user_email, @user_pass)");
  
  res.status(StatusCodes.OK).json(lodash.flattenDeep(new_user.recordsets));
  
}
// **************************************
// *********** Update User **************
// **************************************
const update_user = async (req, res) =>{

    const {id:user_id} = req.params;
    const {
      user_fname,
      user_lname,
      user_nick_name,
      user_phone,
      user_status_id,
      user_role_id
    } = req.body;
    const pool = await sql.connect(db_config);
    let updated_user = await pool.request()
    .input('user_id', sql.Int, user_id)
    .input('user_fname', sql.VarChar, user_fname)
    .input('user_lname', sql.VarChar, user_lname)
    .input('user_nick_name', sql.VarChar, user_nick_name)
    .input('user_phone', sql.Char, user_phone)
    .input('user_status_id', sql.Int, user_status_id)
    .input('user_role_id', sql.Int, user_role_id)
    .query('Update [User] set user_fname= @user_fname, user_lname= @user_lname, user_nick_name = @user_nick_name, user_phone= @user_phone, user_status_id= @user_status_id, user_role_id= @user_role_id  Where user_id= @user_id Select * from [User] where user_id= @user_id');
    updated_user = lodash.flattenDeep(updated_user.recordsets);
    if(!updated_user.length){
      throw new NotFound(`There is no user with the id: ${user_id}`);
    }
    res.status(StatusCodes.OK).json(updated_user);

}
// **************************************
// *********** Delete User ************
// **************************************
const delete_user = async (req, res) =>{
  
    const {id:user_id} = req.params;
    const pool = await sql.connect(db_config);
    let deleted_user = await pool.request()
    .input('user_id', sql.Int, user_id)
    .query('UPDATE Comment SET user_id = 1041 WHERE user_id = @user_id\
            UPDATE Ticket_Assigned_User SET user_id = 1041 WHERE user_id = @user_id\
            UPDATE Ticket SET ticket_submitter_id = 1041 WHERE ticket_submitter_id = @user_id\
            UPDATE Project_User SET user_id = 1041 WHERE user_id = @user_id\
            UPDATE Project SET project_creator_id = 1041 WHERE project_creator_id = @user_id\
            DELETE FROM Notification WHERE user_id = @user_id\
            DELETE FROM [User] WHERE user_id = @user_id');
    if(deleted_user.rowsAffected[6] < 1){
      throw new NotFound(`There is no user with the id: ${user_id}`);
    }
    res.status(StatusCodes.OK).json();
}
// **************************************
// ********** Search All User ***********
// **************************************
const search_all_users = async (req, res) =>{
  const {search_word} = req.query;
  if(search_word){
    const decoded_search_word = search_word.replace(/%20/g, " ");
    const pool = await sql.connect(db_config);
    let result_users = await pool.request()
    .input('decoded_search_word', sql.VarChar, decoded_search_word)
    .query("Select U.user_id, U.user_fname + ' ' + U.user_lname AS [name], R.role_name from [User] U JOIN Role R ON R.role_id = U.user_role_id Where LOWER(U.user_fname) LIKE @decoded_search_word OR LOWER(U.user_lname) LIKE @decoded_search_word OR LOWER(R.role_name) LIKE @decoded_search_word");
    result_users = lodash.flattenDeep(result_users.recordsets);
    res.status(StatusCodes.OK).json(result_users);
  }
  
}

module.exports = {
  get_all_users,
  search_all_users,
  get_user,
  get_assigned_users_ticket,
  get_prj_contributors_info,
  get_all_prj_assigned_users,
  create_user,
  update_user,
  delete_user
} 