const express = require("express");
const app = express();
const cors = require("cors");
const authService = require("./services/auth.service");
const authJWT = require("./helpers/jsonwebtoken.helper");
const errors = require("./helpers/errorhandler.helper");
const authRoutes = require("./routes/auth.routes");

app.use(
  cors({
    origin: ["*", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  authJWT.authenticateToken.unless({
    path: [
      { url: "/api/v1/register", methods: ["POST"] },
      { url: "/api/v1/login", methods: ["POST"] },
    ],
  })
);
app.use("/api/v1", authRoutes);
app.use(errors.errorHandler);

app.get("/", (req, res) => {
  if (req.user) {
    authService.getProfile(req.user.id).then((results) => {
      const name = results?.user?.name;
      return res.status(200).json({
        message: `Welcome ${name} to the auth-experiment API`,
      });
    });
  } else {
    return res
      .status(200)
      .json({ message: "Welcome to the auth-experiment API" });
  }
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});

module.exports = app;
