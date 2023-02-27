const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { unless } = require("express-unless");
const Session = require("../models/session.model");

dotenv.config();

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const error = new Error("Unauthorized");
    error.name = "SessionError";

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) return next(err);

      const session = await Session.findOne({ token }).exec();
      if (!session) return next(error);

      const now = Math.floor(Date.now() / 1000);
      const tokenExp = jwt.decode(token).exp;
      const timeToExp = tokenExp - now;
      const refreshThreshold = 300;
      if (timeToExp < refreshThreshold) {
        const newToken = generateAccessToken(user.id);
        res.setHeader("Authorization", "Bearer " + newToken);
      }

      req.user = user;
      next();
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

    Session.create({ token, user: id });

    return token;
  } catch (error) {
    throw error;
  }
}

async function invalidateAccessToken(id) {
  try {
    await Session.deleteMany({ user: id });
  } catch (error) {
    throw error;
  }
}

authenticateToken.unless = unless;

module.exports = {
  authenticateToken,
  generateAccessToken,
  invalidateAccessToken,
};
