const express = require("express");

const {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  logout,
  deleteProfile,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/profile", getProfile);

router.patch("/profile", updateProfile);

router.patch("/profile/password", updatePassword);

router.delete("/profile", deleteProfile);

router.get("/logout", logout);

module.exports = router;
