const {ApiError}= require("../utils");

function isOfficial(req, res, next) {
  // At this point, authenticate middleware MUST have run
  // So req.user must exist
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  if (req.user.role!== "official") {
    throw new ApiError(403, "Official access required");
  }

  next();
}

module.exports=isOfficial;
