require("dotenv").config();
const bcrypt = require("bcryptjs");
const authServices = require("../../services/auth.service");

function register(req, res, next) {
  if (req.method === "GET") {
    return res.render("auth/register", {
      title: "Auth-Experiment | Register",
    });
  } else {
    const requiredFields = [
      "name",
      "username",
      "email",
      "password",
      "confirmPassword",
    ];

    const error = validateData(req.body, requiredFields);
    if (error !== "") {
      return res.render("auth/register", {
        title: "Auth-Experiment | Register",
        message: error,
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.render("auth/register", {
        title: "Auth-Experiment | Register",
        message: "Passwords do not match",
      });
    }

    if (req.body.password.length < 8) {
      return res.render("auth/register", {
        title: "Auth-Experiment | Register",
        message: "Password must be at least 8 characters",
      });
    }

    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

    authServices
      .register({ name, email, username, password })
      .then((results) => {
        res.setHeader("Authorization", "Bearer " + results.token);
        return res.redirect("/profile");
      })
      .catch((err) => {
        return res.render("auth/register", {
          title: "Auth-Experiment | Register",
          message: err,
        });
      });
  }
}

function login(req, res, next) {
  if (req.method === "GET") {
    return res.render("auth/login", {
      title: "Auth-Experiment | Login",
    });
  } else {
    const requiredFields = ["username", "password"];

    const error = validateData(req.body, requiredFields);
    if (error !== "") {
      return res.render("auth/login", {
        title: "Auth-Experiment | Login",
        message: error,
      });
    }

    const username = req.body.username;
    const password = req.body.password;

    authServices
      .login(username, password)
      .then((results) => {
        res.setHeader("Authorization", "Bearer " + results.token);
        return res.redirect("/profile");
      })
      .catch((err) => {
        return res.render("auth/login", {
          title: "Auth-Experiment | Login",
          message: err,
        });
      });
  }
}

function getProfile(req, res, next) {
  if (!req.user) return res.redirect("/login");
  const id = req.user.id;
  authServices
    .getProfile(id)
    .then((results) =>
      res.render("auth/profile", {
        title: "Auth-Experiment | Profile",
        user: results.user,
      })
    )
    .catch((err) => {
      return res.render("error", {
        title: "Auth-Experiment | Error",
        message: err,
      });
    });
}

function updateProfile(req, res, next) {}

function updatePassword(req, res, next) {}

function deleteProfile(req, res, next) {}

function logout(req, res, next) {
  if (!req.user) return res.redirect("/login");
  const id = req.user.id;
  authServices
    .logout(id)
    .then((results) => {
      return res.redirect("/");
    })
    .catch((err) => {
      return res.render("error", {
        title: "Auth-Experiment | Error",
        message: err,
      });
    });
}

function validateData(data, requiredFields) {
  const missingFields = requiredFields.filter((field) => {
    return !(field in data) || data[field].trim() === "";
  });
  let message = "";
  if (missingFields.length > 0) {
    const fieldNames = missingFields.join(", ");
    message = `Please fill out the following required field(s): ${fieldNames}`;
  }
  return message;
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  deleteProfile,
  logout,
};
