const {StatusCodes} = require('http-status-codes');

const error_handler_middleware = (err, req, res, next)=>{
  let customerError = {
    statusCode:err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong! Please try again later.'
  }
  if(err.number && err.number === 515){
    customerError.msg = 'Fields with * cannot be empty!';
  }
  // console.log(err);
  return res.status(customerError.statusCode).json({msg: customerError.msg});

  
}

module.exports = error_handler_middleware;