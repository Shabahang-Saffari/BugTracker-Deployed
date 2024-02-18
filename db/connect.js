// ** this module needs to be checked to see if I need it or not?!
const sql = require('mssql');



const connect_db = async (config) =>{
  try {
    const pool = await sql.connect(config);
    return pool;
  } 
  catch (error) {
    console.log(error);
  }
}


module.exports = {
  connect_db
}