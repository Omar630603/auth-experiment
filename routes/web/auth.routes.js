const express = require("express");

const {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  logout,
  deleteProfile,
} = require("../../controllers/web/auth.controller");

const router = express.Router();

router.get("/register", register);
router.post("/register", register);

router.get("/login", login);
router.post("/login", login);

router.get("/profile", getProfile);

router.get("/profile/update", updateProfile);
router.post("/profile/update", updateProfile);

router.get("/profile/update/password", updatePassword);
router.post("/profile/update/password", updatePassword);

router.post("/profile", deleteProfile);

router.get("/logout", logout);

module.exports = router;
