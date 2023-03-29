const express = require("express");

const {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  deleteProfile,
} = require("../../controllers/api/auth.controller");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/profile", getProfile);

router.patch("/profile", updateProfile);

router.patch("/profile/password", updatePassword);

router.delete("/profile", deleteProfile);

module.exports = router;
