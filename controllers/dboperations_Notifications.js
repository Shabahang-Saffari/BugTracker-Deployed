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
// *** Returning Decoded Token info *****
// **************************************
const return_decoded_token = async (req, res)=>{
  const{user_id, user_role, user_status_id} = req.user;
  res.status(StatusCodes.OK).json({user_id, user_role, user_status_id});
}
// **************************************
// ****** Get All Notifications **********
// **************************************
const get_all_notifications = async (req, res) =>{
    const {id:user_id} = req.params;
    const pool = await sql.connect(db_config);
    let notifications = await pool.request()
    .input('user_id', sql.Int, user_id)
    .query("Select notification_id, NS.notification_status, notification_desc, Format(notification_date, 'MMM dd') notification_date from [Notification] N JOIN Notification_Status NS ON NS.notification_status_id = N.notification_status_id Where N.user_id = @user_id");
    notifications = lodash.flattenDeep(notifications.recordsets);
    res.status(StatusCodes.OK).json(notifications);
  
}
// **************************************
// ****** Create Notifications **********
// **************************************
const create_notifications = async (req, res) =>{
    const {
      user_id,
      notification_desc,
      notification_date
    } = req.body;
    const pool = await sql.connect(db_config);
    let new_notifications = await pool.request()
    .input('user_id', sql.Int, user_id)
    .input('notification_desc', sql.VarChar, notification_desc)
    .input('notification_date', sql.Date, notification_date)
    .query("INSERT INTO Notification (user_id, notification_status_id, notification_desc, notification_date) Values (@user_id, 1, @notification_desc, @notification_date)");
    new_notifications = lodash.flattenDeep(new_notifications.recordsets);
    res.status(StatusCodes.OK).json(new_notifications);
  
}
// **************************************
// ******* Update Notification **********
// **************************************
const update_notification = async (req, res) =>{

    const {id:notification_id} = req.params;
    const {
      user_id,
      notification_status_id,
      notification_desc
    } = req.body;
    const pool = await sql.connect(db_config);
    let updated_notification = await pool.request()
    .input('notification_id', sql.Int, notification_id)
    .input('user_id', sql.Int, user_id)
    .input('notification_status_id', sql.Int, notification_status_id)
    .input('notification_desc', sql.VarChar, notification_desc)
    .query('Update Notification set user_id= @user_id, notification_status_id= @notification_status_id, notification_desc= @notification_desc Where notification_id= @notification_id Select * from Notification where notification_id= @notification_id');
    updated_notification = lodash.flattenDeep(updated_notification.recordsets);
    if(!updated_notification.length){
      throw new NotFound(`There is no notification with the id: ${notification_id}`);
    }
    res.status(StatusCodes.OK).json(updated_notification);

}
// **************************************
// ******** Delete Notification *********
// **************************************
const delete_notification = async (req, res) =>{
    const {id:notification_id} = req.params;
    const pool = await sql.connect(db_config);
    let deleted_notification = await pool.request()
    .input('notification_id', sql.Int, notification_id)
    .query('Delete from Notification where notification_id = @notification_id');
    if(deleted_notification.rowsAffected[0] < 1){
      throw new NotFound(`There is no notification with the id: ${notification_id}`);
    }
    res.status(StatusCodes.OK).json();
}

module.exports = {
  return_decoded_token,
  get_all_notifications,
  create_notifications,
  update_notification,
  delete_notification
} 