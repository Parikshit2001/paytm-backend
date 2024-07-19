const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddlware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      message: "No authorization header found or it does not startsWith Bearer",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(403).json({
      message: "Invalid token sent in authorization header",
      tokenReceived: token
    });
  }
};

module.exports = {
  authMiddlware,
};
