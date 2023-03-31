const express = require("express");

const {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  deleteProfile,
  logout,
} = require("../../controllers/web/auth.controller");

const router = express.Router();

function isLoggedIn(req, res, next) {
  if (req.user) {
    if (req.path === "/login" || req.path === "/register")
      return res.redirect("/");
    return next();
  } else {
    if (req.path === "/login" || req.path === "/register") return next();
    return res.redirect("/login");
  }
}

router.get("/register", isLoggedIn, register);
router.post("/register", isLoggedIn, register);

router.get("/login", isLoggedIn, login);
router.post("/login", isLoggedIn, login);

router.get("/profile", isLoggedIn, getProfile);

router.get("/profile/update", isLoggedIn, updateProfile);
router.post("/profile/update", isLoggedIn, updateProfile);

router.get("/profile/update/password", isLoggedIn, updatePassword);
router.post("/profile/update/password", isLoggedIn, updatePassword);

router.post("/profile/delete", isLoggedIn, deleteProfile);

router.get("/logout", isLoggedIn, logout);

module.exports = router;
