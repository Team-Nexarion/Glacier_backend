const jwt = require("jsonwebtoken");
const { ApiError } = require("../utils");

function authenticate(req, res, next) {
  const token =
    req.cookies?.authToken ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // SINGLE source of truth
    req.user = decoded;

    next();
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}


module.exports=authenticate;