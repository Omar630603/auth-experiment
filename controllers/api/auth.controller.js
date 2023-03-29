const bcrypt = require("bcryptjs");
const authServices = require("../../services/auth.service");

function register(req, res, next) {
  const requiredFields = [
    "name",
    "username",
    "email",
    "password",
    "confirmPassword",
  ];

  validateData(req.body, res, requiredFields);

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (req.body.password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }

  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

  authServices
    .register({ name, email, username, password })
    .then((results) => res.status(201).json(results))
    .catch((err) => next(err));
}

function login(req, res, next) {
  const requiredFields = ["username", "password"];

  validateData(req.body, res, requiredFields);

  const username = req.body.username;
  const password = req.body.password;

  authServices
    .login(username, password)
    .then((results) => res.status(200).json(results))
    .catch((err) => next(err));
}

function getProfile(req, res, next) {
  const id = req.user.id;
  authServices
    .getProfile(id)
    .then((results) => res.status(200).json(results))
    .catch((err) => next(err));
}

function updateProfile(req, res, next) {
  const id = req.user.id;
  const requiredFields = ["username", "name", "email"];

  validateData(req.body, res, requiredFields);

  const username = req.body?.username ?? "";
  const name = req.body?.name ?? "";
  const email = req.body?.email ?? "";

  authServices
    .updateProfile(id, username, name, email)
    .then((results) => res.status(200).json(results))
    .catch((err) => next(err));
}

function updatePassword(req, res, next) {
  const id = req.user.id;
  const requiredFields = [
    "currentPassword",
    "newPassword",
    "confirmNewPassword",
  ];

  validateData(req.body, res, requiredFields);

  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const confirmNewPassword = req.body.confirmNewPassword;

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "New password do not match" });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters" });
  }

  authServices
    .checkPassword(id, currentPassword)
    .then((results) => {
      if (results) {
        const password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
        authServices
          .updatePassword(id, password)
          .then((results) => {
            res.status(200).json(results);
          })
          .catch((err) => next(err));
      }
    })
    .catch((err) => next(err));
}

function deleteProfile(req, res, next) {
  const id = req.user.id;
  authServices
    .deleteProfile(id)
    .then((results) => res.status(200).json(results))
    .catch((err) => next(err));
}

function validateData(data, res, requiredFields) {
  const missingFields = requiredFields.filter((field) => !(field in data));
  if (missingFields.length > 0) {
    const fieldNames = missingFields.join(", ");
    return res.status(400).json({
      message: `Please fill out the following required field(s): ${fieldNames}`,
    });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  deleteProfile,
};
