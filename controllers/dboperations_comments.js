const sql = require("mssql");
const lodash = require("lodash");

const { StatusCodes } = require("http-status-codes");
const { NotFound } = require("../errors");

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

// **************************************
// ********* Get All Comments ************
// **************************************
const get_all_comments = async (req, res) => {
  const { id: ticket_id } = req.params;
  const { page_index: page_number, number_of_rows: num_per_page } = req.body;
  const my_offset = (page_number - 1) * num_per_page;

  const pool = await sql.connect(db_config);
  let comments = await pool
    .request()
    .input("ticket_id", sql.Int, ticket_id)
    .input("my_offset", sql.Int, my_offset)
    .input("num_per_page", sql.Int, num_per_page)
    .query(
      "Select C.comment_id, U.user_fname + ' ' + U.user_lname full_name, U.user_fname created_by, C.comment_desc, C.comment_date, C.comment_time From Comment C JOIN [User] U ON C.user_id = U.user_id WHERE C.ticket_id = @ticket_id\
  Order By C.comment_id DESC OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY"
    );
  comments = lodash.flattenDeep(comments.recordsets);
  res.status(StatusCodes.OK).json(comments);
};
// **************************************
// ******* Get All Comments QTY *********
// **************************************
const get_all_comments_qty = async (req, res) => {
  const { id: ticket_id } = req.params;

  const pool = await sql.connect(db_config);
  let comments = await pool
    .request()
    .input("ticket_id", sql.Int, ticket_id)
    .query(
      "Select C.comment_id, U.user_fname + ' ' + U.user_lname created_by, C.comment_desc, C.comment_date, C.comment_time From Comment C JOIN [User] U ON C.user_id = U.user_id WHERE C.ticket_id = @ticket_id"
    );

  comments = lodash.flattenDeep(comments.recordsets);
  res.status(StatusCodes.OK).json(comments);
};
// **************************************
// ********* Get Single Comments ********
// **************************************
const get_single_comment = async (req, res) => {
  const { id: comment_id } = req.params;

  const pool = await sql.connect(db_config);
  let comments = await pool
    .request()
    .input("comment_id", sql.Int, comment_id)
    .query(
      "Select C.comment_id, C.user_id created_by, C.comment_desc, C.comment_date, C.comment_time From Comment C WHERE C.comment_id = @comment_id"
    );
  comments = lodash.flattenDeep(comments.recordsets);
  res.status(StatusCodes.OK).json(comments);
};
// **************************************
// *********** Create Comment ***********
// **************************************
const create_comment = async (req, res) => {
  const {
    ticket_id,
    project_id,
    comment_submitter_id,
    new_comment_desc,
    new_comment_date,
    new_comment_time,
  } = req.body;
  const pool = await sql.connect(db_config);
  let new_comment = await pool
    .request()
    .input("ticket_id", sql.Int, ticket_id)
    .input("project_id", sql.Int, project_id)
    .input("comment_submitter_id", sql.Int, comment_submitter_id)
    .input("new_comment_desc", sql.VarChar, new_comment_desc)
    .input("new_comment_date", sql.Date, new_comment_date)
    .input("new_comment_time", sql.VarChar, new_comment_time)
    .query(
      "Insert into Comment (ticket_id, project_id, user_id, comment_desc, comment_date, comment_time) Values (@ticket_id, @project_id, @comment_submitter_id, @new_comment_desc, @new_comment_date, CONVERT(time, @new_comment_time))"
    );

  res.status(StatusCodes.OK).json(lodash.flattenDeep(new_comment.recordsets));
};
// **************************************
// *********** Update Comment ***********
// **************************************
const update_comment = async (req, res) => {
  const { id: comment_id } = req.params;
  const { edited_comment_desc } = req.body;

  const pool = await sql.connect(db_config);
  let updated_comment = await pool
    .request()
    .input("comment_id", sql.Int, comment_id)
    .input("edited_comment_desc", sql.VarChar, edited_comment_desc)
    .query(
      "Update comment set comment_desc= @edited_comment_desc WHERE comment_id= @comment_id Select * from Comment where comment_id= @comment_id"
    );
  updated_comment = lodash.flattenDeep(updated_comment.recordsets);
  if (!updated_comment.length) {
    throw new NotFound(`There is no comment with the id: ${comment_id}`);
  }
  res.status(StatusCodes.OK).json(updated_comment);
};
// **************************************
// *********** Delete Comment ************
// **************************************
const delete_comment = async (req, res) => {
  const { id: comment_id } = req.params;
  const pool = await sql.connect(db_config);
  let deleted_comment = await pool
    .request()
    .input("comment_id", sql.Int, comment_id)
    .query("Delete from Comment where comment_id = @comment_id");
  if (deleted_comment.rowsAffected[0] < 1) {
    throw new NotFound(`There is no comment with the id: ${comment_id}`);
  }
  res.status(StatusCodes.OK).json();
};

// **************************************
// *** Search in Ticket's Comments ******
// **************************************
const search_comments = async (req, res) => {
  const { id: ticket_id } = req.params;
  const { search_word } = req.query;

  const { page_index: page_number, number_of_rows: num_per_page } = req.body;

  const my_offset = (page_number - 1) * num_per_page;
  if (search_word) {
    const decoded_search_word = search_word.replace(/%20/g, " ");
    const pool = await sql.connect(db_config);
    let search_result = await pool
      .request()
      .input("ticket_id", sql.Int, ticket_id)
      .input("decoded_search_word", sql.VarChar, decoded_search_word)
      .input("my_offset", sql.Int, my_offset)
      .input("num_per_page", sql.Int, num_per_page)
      .query(
        "Select C.comment_id, U.user_fname created_by, C.comment_desc, C.comment_date, C.comment_time From Comment C\
            JOIN [User] U ON C.user_id = U.user_id\
            WHERE C.ticket_id = @ticket_id \
            AND \
            (\
            LOWER(U.user_fname) LIKE @decoded_search_word \
            OR LOWER(C.comment_desc) LIKE @decoded_search_word\
            OR C.comment_date LIKE @decoded_search_word\
            OR C.comment_time LIKE @decoded_search_word\
            )\
            Order By C.ticket_id OFFSET @my_offset ROWS Fetch Next @num_per_page ROWS ONLY"
      );

    search_result = lodash.flattenDeep(search_result.recordsets);
    if (!search_result.length) {
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(search_result);
  }
};

// ***************************************
// *** Search in Ticket's Comments QTY ***
// ***************************************
const search_comments_qty = async (req, res) => {
  const { id: ticket_id } = req.params;
  const { search_word } = req.query;

  if (search_word) {
    const decoded_search_word = search_word.replace(/%20/g, " ");
    const pool = await sql.connect(db_config);
    let search_result = await pool
      .request()
      .input("ticket_id", sql.Int, ticket_id)
      .input("decoded_search_word", sql.VarChar, decoded_search_word)
      .query(
        "Select C.comment_id, U.user_fname created_by, C.comment_desc, C.comment_date, C.comment_time From Comment C\
            JOIN [User] U ON C.user_id = U.user_id\
            WHERE C.ticket_id = @ticket_id \
            AND \
            (\
            LOWER(U.user_fname) LIKE @decoded_search_word \
            OR LOWER(C.comment_desc) LIKE @decoded_search_word\
            OR C.comment_date LIKE @decoded_search_word\
            OR C.comment_time LIKE @decoded_search_word\
            )"
      );

    search_result = lodash.flattenDeep(search_result.recordsets);
    if (!search_result.length) {
      return res.status(StatusCodes.OK).send();
    }
    res.status(StatusCodes.OK).json(search_result);
  }
};

module.exports = {
  get_all_comments,
  get_all_comments_qty,
  get_single_comment,
  create_comment,
  update_comment,
  delete_comment,
  search_comments,
  search_comments_qty,
};
