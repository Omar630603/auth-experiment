const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { unless } = require("express-unless");
const User = require("../models/user.model");

dotenv.config();
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];
    if (token == null) token = req.cookies?.token;
    if (token == null) {
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) return next(err);

      const userData = await User.findById(user.id).exec();
      req.user = user;

      if (userData) req.user.data = userData.toJSON();
      return next();
    });
  } catch (err) {
    next(err);
  }
}

function generateAccessToken(id) {
  try {
    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    return token;
  } catch (error) {
    throw error;
  }
}

authenticateToken.unless = unless;

module.exports = {
  authenticateToken,
  generateAccessToken,
};
