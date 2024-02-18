const express = require("express");
const router = express.Router();
const { log_out_close_db_connection } = require("../controllers/log_out");

router.route("/").get(log_out_close_db_connection);

module.exports = router;