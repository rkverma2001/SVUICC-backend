const mongoose = require("mongoose");

const TalentUserSchema = new mongoose.Schema({
  firstName: String,

  lastName: String,

  email: String,

  phone: String,

  redeemCode: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TalentUser", TalentUserSchema);
