const sql = require("mssql");
const lodash = require("lodash");

const { StatusCodes } = require("http-status-codes");

const db_config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_Database,
  options: {
    trustedconnection: true,
    trustServerCertificate: true,
    encrypt: true,
    enablearithAort: true,
    instancename: "DESKTOP-J01LV4J",
  },
  port: parseInt(process.env.DB_PORT),
};

// *********************************************
// ***************** Log Out *******************
// *********************************************
const log_out_close_db_connection = async (req, res) => {
  const pool = await sql.connect(db_config);
  let projects = await pool
    .request()
    .query("Select count(*) AS projects_qty from Project");
  pool.close();
  res.status(StatusCodes.OK).json();
};

module.exports = { log_out_close_db_connection };
