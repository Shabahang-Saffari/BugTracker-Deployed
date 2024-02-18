const sql = require('mssql');
const lodash = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {StatusCodes} = require('http-status-codes');
const {BadRequestError} = require('../errors');

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
// ******** Register New User ***********
// **************************************
const sign_up = async (req, res)=>{
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

  const salt = await bcrypt.genSalt(10);
  user_pass = await bcrypt.hash(user_pass, salt);

  const pool1 = await sql.connect(db_config);
  let new_email = await pool1.request()
  .input('user_email', sql.VarChar, user_email)
  .query("Select U.user_id From [User] U Where U.user_email = @user_email");
  
  new_email = lodash.flattenDeep(new_email.recordsets);
  console.log(new_email);

  if(new_email.length){
    throw new BadRequestError(`A user with the email address "${user_email}" already exists! Please use another email address.`);
  }

  const pool2 = await sql.connect(db_config);
  let new_user = await pool2.request()
  .input('user_fname', sql.VarChar, user_fname)
  .input('user_lname', sql.VarChar, user_lname)
  .input('user_nick_name', sql.VarChar, user_nick_name)
  .input('user_phone', sql.Char, user_phone)
  .input('user_email', sql.VarChar, user_email)
  .input('user_pass', sql.VarChar, user_pass)
  .query("Insert into [User] (user_fname, user_lname, user_nick_name, user_phone, user_email, user_pass) Values (@user_fname, @user_lname, @user_nick_name, @user_phone, @user_email, @user_pass) Select U.user_id, U.user_fname, U.user_nick_name, U.user_lname, U.user_pass, R.role_name from [User] U JOIN Role R ON R.role_id = U.user_role_id JOIN User_Status US ON US.user_status_id = U.user_status_id Where U.user_email = @user_email");
  
  new_user = lodash.flattenDeep(new_user.recordsets);
  const user_id = new_user[0].user_id;
  const user_role = new_user[0].role_name;
  const user_token = jwt.sign({user_id, user_email, user_role}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME});

  res.status(StatusCodes.CREATED).json(user_token);
}

module.exports = {sign_up};