const bcrypt = require("bcryptjs");
const authServices = require("../../services/auth.service");

function register(req, res, next) {
  if (req.method === "GET") {
    return res.render("auth/register", {
      title: "Auth-Experiment | Register",
      message: req.body.message,
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
      req.method = "GET";
      req.body.message = error;
      return register(req, res, next);
    }

    if (req.body.password !== req.body.confirmPassword) {
      req.method = "GET";
      req.body.message = "Passwords do not match";
      return register(req, res, next);
    }

    if (req.body.password.length < 8) {
      req.method = "GET";
      req.body.message = "Password must be at least 8 characters";
      return register(req, res, next);
    }

    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

    authServices
      .register({ name, email, username, password })
      .then((results) => {
        res.cookie("token", results.token, { maxAge: 60 * 60 * 1000 });
        return res.redirect("/profile");
      })
      .catch((err) => {
        req.method = "GET";
        req.body.message = err;
        return register(req, res, next);
      });
  }
}

function login(req, res, next) {
  if (req.method === "GET") {
    return res.render("auth/login", {
      title: "Auth-Experiment | Login",
      message: req.body.message,
    });
  } else {
    const requiredFields = ["username", "password"];

    const error = validateData(req.body, requiredFields);
    if (error !== "") {
      req.method = "GET";
      req.body.message = error;
      return login(req, res, next);
    }

    const username = req.body.username;
    const password = req.body.password;

    authServices
      .login(username, password)
      .then((results) => {
        res.cookie("token", results.token, { maxAge: 60 * 60 * 1000 });
        return res.redirect("/profile");
      })
      .catch((err) => {
        req.method = "GET";
        req.body.message = err;
        return login(req, res, next);
      });
  }
}

function getProfile(req, res, next) {
  return res.render("auth/profile", {
    title: "Auth-Experiment | Profile",
    user: req.user.data,
    message: req.body.message,
  });
}

function updateProfile(req, res, next) {
  const id = req.user.id;
  if (req.method == "GET") {
    res.render("auth/edit", {
      title: "Auth-Experiment | Update Profile",
      user: req.user.data,
      type: "profile",
      message: req.body.message,
    });
  } else {
    const requiredFields = ["username", "name", "email"];

    const error = validateData(req.body, requiredFields);
    if (error !== "") {
      req.method = "GET";
      req.body.message = error;
      return updateProfile(req, res, next);
    }

    const username = req.body.username ?? "";
    const name = req.body.name ?? "";
    const email = req.body.email ?? "";

    authServices
      .updateProfile(id, username, name, email)
      .then((results) =>
        res.render("auth/edit", {
          title: "Auth-Experiment | Update Profile",
          user: results.user,
          type: "profile",
          message: results.message,
        })
      )
      .catch((err) => {
        req.method = "GET";
        req.body.message = err;
        return updateProfile(req, res, next);
      });
  }
}

function updatePassword(req, res, next) {
  if (req.method == "GET") {
    return res.render("auth/edit", {
      title: "Auth-Experiment | Update Password",
      user: req.user.data,
      type: "password",
      message: req.body.message,
    });
  } else {
    const id = req.user.id;
    const requiredFields = [
      "currentPassword",
      "newPassword",
      "confirmNewPassword",
    ];

    const error = validateData(req.body, requiredFields);
    if (error !== "") {
      req.method = "GET";
      req.body.message = error;
      return updatePassword(req, res, next);
    }

    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmNewPassword = req.body.confirmNewPassword;

    if (newPassword !== confirmNewPassword) {
      req.method = "GET";
      req.body.message = "New password do not match";
      return updatePassword(req, res, next);
    }

    if (newPassword.length < 8) {
      req.method = "GET";
      req.body.message = "Password must be at least 8 characters";
      return updatePassword(req, res, next);
    }

    authServices
      .checkPassword(id, currentPassword)
      .then((results) => {
        if (results) {
          const password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
          authServices
            .updatePassword(id, password)
            .then((results) => {
              req.body.message = results.message;
              return getProfile(req, res, next);
            })
            .catch((err) => {
              req.method = "GET";
              req.body.message = err;
              return updatePassword(req, res, next);
            });
        }
      })
      .catch((err) => {
        req.method = "GET";
        req.body.message = err;
        return updatePassword(req, res, next);
      });
  }
}

function deleteProfile(req, res, next) {
  const id = req.user.id;
  authServices.deleteProfile(id).then((results) => {
    res.clearCookie("token");
    return res.redirect("/");
  });
}

function logout(req, res, next) {
  res.clearCookie("token");
  return res.redirect("/");
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
