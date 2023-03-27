const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { unless } = require("express-unless");

dotenv.config();
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];

    if (token == null) token = localStorage.getItem("token");
    if (token == null) {
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) return next(err);

      req.user = user;
      if (req.path === "/login" || req.path === "/register") {
        return res.redirect("/");
      }
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
    localStorage.setItem("token", token);
    return token;
  } catch (error) {
    throw error;
  }
}

async function invalidateAccessToken(id) {
  try {
    localStorage.removeItem("token");
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
