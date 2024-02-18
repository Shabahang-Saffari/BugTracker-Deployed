require('express-async-errors');
require('dotenv').config();

// *** Extra Security Packages ***
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

const express = require('express');
const app = express();
const port = process.env.PORT || 100;

const login = require('./routes/login');
const sign_up = require('./routes/sign_up');
const projects = require('./routes/projects');
const tickets = require('./routes/tickets');
const comments = require('./routes/comments');
const users = require('./routes/users');
const notifications = require('./routes/notifications');
const logout = require("./routes/logout.js");

const {authentication_middleware} = require('./middleware/auth.js');
const not_found = require('./middleware/not_found');
const error_handler_middleware = require('./middleware/error_handler');


app.set('trust proxy', 1);
app.use(rateLimiter({
	windowMs: 1 * 60 * 1000, // 15 minutes
	max: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.
}));
app.use(express.static('./public'));
app.use(express.json());

app.use(helmet());
app.use(cors());
app.use(xss());


// *** Routes ***
app.use('/api/v1/login', login);
app.use('/api/v1/sign_up', sign_up);
app.use('/api/v1/projects',authentication_middleware, projects);
app.use('/api/v1/tickets',authentication_middleware, tickets);
app.use('/api/v1/comments',authentication_middleware, comments);
app.use('/api/v1/users',authentication_middleware, users);
app.use('/api/v1/notifications',authentication_middleware, notifications);
app.use("/api/v1/logout", authentication_middleware, logout);

// *** Handeling 404 responses ***
app.use(not_found);
// ** custome error handler **
app.use(error_handler_middleware);

const start = async()=>{
  try {
    app.listen(port, ()=>{console.log(`Server is listening on port ${port}`)});
  } 
  catch (error) {
    console.log(error);
  }
}
start();