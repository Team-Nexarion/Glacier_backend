class ApiError extends Error {
  constructor(statusCode = 400,message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ApiError;