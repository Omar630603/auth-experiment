const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const authJWT = require("../helpers/jsonwebtoken.helper");

async function register(params) {
  const user = new User(params);
  await user.save();
  if (user) {
    const token = authJWT.generateAccessToken(user.id);
    return {
      user: user.toJSON(),
      token: token,
      message: "Registered Successfully",
    };
  } else throw "Registration Failed";
}

async function login(username, password) {
  const user = await User.findOne({
    $or: [{ username: username }, { email: username }],
  }).exec();
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = authJWT.generateAccessToken(user.id);
    return { user: user.toJSON(), token: token, message: "Logged In" };
  } else throw "Incorrect Username or Password";
}

async function getProfile(id) {
  const user = await User.findById(id).exec();
  return { user: user.toJSON(), message: "Profile Retrieved Successfully" };
}

async function checkPassword(id, password) {
  const user = await User.findById(id).exec();
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else throw "Incorrect Password";
}

async function updateProfile(id, username, name, email) {
  const userData = await User.findById(id).exec();

  const update = {
    username: username == "" ? userData.username : username,
    name: name == "" ? userData.name : name,
    email: email == "" ? userData.email : email,
  };

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
  });

  if (!user) throw "Update Failed";

  return { user: user.toJSON(), message: "Updated Profile Successfully" };
}

async function updatePassword(id, password) {
  const update = {
    password: password,
  };

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
  });

  if (!user) throw "Update Failed";

  return { user: user.toJSON(), message: "Updated Password Successfully" };
}

async function deleteProfile(id) {
  authJWT.invalidateAccessToken(id);
  const user = await User.findByIdAndDelete(id).exec();
  if (!user) throw "Delete Failed";
  return { message: "Deleted Successfully" };
}

async function logout(id) {
  authJWT.invalidateAccessToken(id);
  return { message: "Logged Out" };
}

module.exports = {
  login,
  register,
  checkPassword,
  getProfile,
  updateProfile,
  updatePassword,
  deleteProfile,
  logout,
};
