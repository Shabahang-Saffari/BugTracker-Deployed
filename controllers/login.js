const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail')

const sql = require('mssql');
const lodash = require('lodash');

const {StatusCodes} = require('http-status-codes');
const {BadRequestError, UnauthenticatedError} = require('../errors');

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

const demo_users_emails = [
  "demo_user@gmail.com",
  "demo_user2@gmail.com",
  "demo_user3@gmail.com",
  "demo_user4@gmail.com",
];

// **************************************
// ******** Get User By Email ***********
// **************************************
const get_user_by_email = async (req, res) =>{

  const {user_email, user_password:candidate_password} = req.body;

  // ********** Setting the DB **********
  if (demo_users_emails.includes(user_email)) {
    db_config.server = process.env.DB_HOST_Demo;
    db_config.database = process.env.DB_Database_Demo;
  } else {
    db_config.server = process.env.DB_HOST;
    db_config.database = process.env.DB_Database;
  }
  // ************************************

  const pool = await sql.connect(db_config);
  let user = await pool.request()
  .input('user_email', sql.VarChar, user_email)
  .query("Select U.user_id, U.user_fname, U.user_nick_name, U.user_lname, U.user_pass, R.role_name, U.user_status_id from [User] U JOIN Role R ON R.role_id = U.user_role_id JOIN User_Status US ON US.user_status_id = U.user_status_id Where U.user_email = @user_email"); 
  user = lodash.flattenDeep(user.recordsets);

  if(!user.length){
    throw new UnauthenticatedError(`Invalid Credentials!`);
  }
  const pass_matching = await bcrypt.compare(candidate_password, user[0].user_pass);
  if(!pass_matching){
    throw new UnauthenticatedError('Password is incorrect!');
  }

  const user_id = user[0].user_id;
  const user_nick_name = user[0].user_nick_name;
  const user_role = user[0].role_name;
  const user_status_id = user[0].user_status_id;

  const user_token = jwt.sign({user_id, user_nick_name, user_role, user_status_id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME});

  res.status(StatusCodes.OK).json({user_token});
}
// **************************************
// *** reset_pass (Forgot Password) *****
// **************************************
const reset_pass = async (req, res) =>{

  const {user_email} = req.body;
  let user_new_pass = "";
  const pass_chars = "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWyYzZ!@#$%*123456789";
  const pass_length = 10;

  for(let i=0; i<pass_length; i++){
    let random_num = Math.floor(Math.random() * pass_chars.length);
    user_new_pass += pass_chars.substring(random_num, random_num + 1);
  }

  const salt = await bcrypt.genSalt(10);
  const encrypted_user_pass = await bcrypt.hash(user_new_pass, salt);


  const pool = await sql.connect(db_config);
  let user = await pool.request()
  .input('user_email', sql.VarChar, user_email)
  .input('encrypted_user_pass', sql.VarChar, encrypted_user_pass)
  .query("UPDATE [User] SET user_pass = @encrypted_user_pass WHERE user_email = @user_email\
  SELECT * From [User] WHERE user_email = @user_email");

  user = lodash.flattenDeep(user.recordsets);
  if(!user.length){
    throw new UnauthenticatedError(`this email does not exist!`);
  }
  // *************** emailing new pass ****************
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
  to: `${user_email}`, // Change to your recipient
  from: 'shabahang.saffari@gmail.com', // Change to your verified sender
  subject: 'Reset Password',
  text: 'Text Here.',
  html: `<h1
      style="
        font-size: 30px;
        font-family: Arial, sans-serif;
        text-decoration: underline;
        margin: 0;
        color: #52c8d7;
      "
    >
      BugTracker
    </h1>
    <h5
      style="
        font-family: Arial, sans-serif;
        margin: 0px 0px 0px 0px;
        font-size: 12px;
      "
    >
      by Shabahang Saffari
    </h5>
    <h3
      style="
        font-family: Arial, sans-serif;
        margin: 50px 0px 0px 0px;
        font-size: 18px;
      "
    >
      You have reset your password. Your new password is
    </h3>
    <div
      style="
        display: flex;
        justify-content: center;
        width: 400px;
        align-items: center;
        margin: 5px 0px 0px 0px;
      "
    >
      <span
        style="
          font-family: Arial, sans-serif;
          font-size: 24px;
          color: white;
          background: #722aa9;
        "
        >${user_new_pass}</span
      >
    </div>
    <p
      style="
        font-family: Arial, sans-serif;
        margin: 50px 0px 0px 0px;
        font-size: 14px;
      "
    >
      Thank you for using the BugTracker.
    </p>
    <span style="font-family: Arial, sans-serif; font-size: 14px">
      Shabahang Saffari | Developer
    </span>`,
  }
  const email_info = await sgMail.send(msg);

  res.status(StatusCodes.OK).json();
}


module.exports = {
  get_user_by_email,
  reset_pass
}