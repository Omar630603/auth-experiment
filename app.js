const express = require("express");
const path = require("path");
const ejsLayouts = require("express-ejs-layouts");
const app = express();
const cors = require("cors");
const authJWT = require("./helpers/jsonwebtoken.helper");
const errors = require("./helpers/errorhandler.helper");
const authApiRoutes = require("./routes/api/auth.routes");
const authWebRoutes = require("./routes/web/auth.routes");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: ["*", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "web")));
app.use(ejsLayouts);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "web", "views"));
app.set("layout", path.join(__dirname, "web", "layouts", "main"));

app.use(
  authJWT.authenticateToken.unless({
    path: [
      { url: "/register", methods: ["POST"] },
      { url: "/login", methods: ["POST"] },
      { url: "/api/v1/register", methods: ["POST"] },
      { url: "/api/v1/login", methods: ["POST"] },
    ],
  })
);

app.get("/", (req, res) => {
  if (req.user) {
    return res.render("index", {
      title: "Auth-Experiment | Home",
      user: req.user.data,
    });
  } else {
    return res.render("index", {
      title: "Auth-Experiment | Home",
      user: req.user,
    });
  }
});

app.use("/", authWebRoutes);
app.use("/api/v1", authApiRoutes);
app.use(errors.errorHandler);

app.get("/api/v1/test", (req, res) => {
  return res
    .status(200)
    .json({ message: "Welcome to the Auth-Experiment API" });
});

app.use((req, res, next) => {
  const error = { status: 404, message: "NOT FOUND" };
  return res.render("error", {
    title: "Auth-Experiment | Error",
    error,
    user: req.user,
  });
});

module.exports = app;
