class ApiSuccess {
  constructor({
    message = "Success",
    data = null,
    statusCode = 200
  }) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}
module.exports = ApiSuccess;