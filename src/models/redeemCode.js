const mongoose = require("mongoose");

const RedeemCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },

  used: {
    type: Boolean,
    default: false,
  },

  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TalentUser",
    default: null,
  },
});

module.exports = mongoose.model("RedeemCode", RedeemCodeSchema);
