const jwt = require('jsonwebtoken');
const {UnauthenticatedError} = require('../errors');

const authentication_middleware = async (req, res, next)=>{
  
  const auth_header = req.headers.authorization;
  if(!auth_header || !auth_header.startsWith('Bearer')){
    throw new UnauthenticatedError('You do not have access to this page!');
  }
  const user_token = auth_header.split(' ')[1];
  try {
    const decoded_token = jwt.verify(user_token, process.env.JWT_SECRET);
    const {user_id, user_role, user_status_id} = decoded_token;
    req.user = {user_id, user_role, user_status_id};
    next();
  } 
  catch (error) {
    throw new UnauthenticatedError('You are not authorized to access this route!');
  }

}

module.exports = {
  authentication_middleware
}