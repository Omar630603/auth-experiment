const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "sessions",
  }
);

module.exports = mongoose.model("Session", sessionSchema);
