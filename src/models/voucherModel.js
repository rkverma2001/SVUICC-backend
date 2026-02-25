const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    voucherCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    isRedeemed: {
      type: Boolean,
      default: false,
    },

    redeemedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Voucher", voucherSchema);
