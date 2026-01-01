const authenticate=require("./auth");
const isAdmin=require("./isAdmin");
const upload=require("./multer");
const errorHandler=require("./errorHandler");
const isOfficial=require("./isOfficial");
module.exports = {
  authenticate,
  isAdmin,
  upload,
  errorHandler,
  isOfficial
};
