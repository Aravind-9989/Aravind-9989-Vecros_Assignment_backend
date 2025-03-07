const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "User not logged in! Please log in again." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
