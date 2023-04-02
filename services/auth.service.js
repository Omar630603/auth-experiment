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
      message: "Registered User Successfully",
    };
  } else throw "Registration User Failed";
}

async function login(username, password) {
  const user = await User.findOne({
    $or: [{ username: username }, { email: username }],
  }).exec();
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = authJWT.generateAccessToken(user.id);
    return {
      user: user.toJSON(),
      token: token,
      message: "Logged In User Successfully",
    };
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

  if (!user) throw "Profile Update Failed";

  return { user: user.toJSON(), message: "Profile Updated Successfully" };
}

async function updatePassword(id, password) {
  const update = {
    password: password,
  };

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
  });

  if (!user) throw "Password Update Failed";

  return { user: user.toJSON(), message: "Password Updated Successfully" };
}

async function deleteProfile(id) {
  const user = await User.findByIdAndDelete(id).exec();
  if (!user) throw "User Delete Failed";
  return { message: "User Deleted Successfully" };
}

module.exports = {
  register,
  login,
  checkPassword,
  getProfile,
  updateProfile,
  updatePassword,
  deleteProfile,
};
