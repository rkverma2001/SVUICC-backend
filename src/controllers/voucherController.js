const mongoose = require("mongoose");
const crypto = require("crypto");
const Voucher = require("../models/voucherModel");
const Order = require("../models/orderModel");



/* ==========================================
   AUTO GENERATE UNIQUE VOUCHER CODE
========================================== */
const generateVoucherCode = (prefix = "SVU", length = 8) => {
  const randomString = crypto
    .randomBytes(length)
    .toString("hex")
    .slice(0, length)
    .toUpperCase();

  return `${prefix}-${randomString}`;
};

/* ==========================================
   BULK AUTO CREATE VOUCHERS
========================================== */
const generate = async (req, res) => {
  try {
    const { count, prefix } = req.body;

    if (!count || count <= 0) {
      return res.status(400).json({ message: "Valid count is required" });
    }

    const vouchers = [];
    const existingCodes = new Set();

    while (vouchers.length < count) {
      const code = generateVoucherCode(prefix || "SVU", 8);

      if (!existingCodes.has(code)) {
        existingCodes.add(code);
        vouchers.push({ voucherCode: code });
      }
    }

    const inserted = await Voucher.insertMany(vouchers);

    res.status(201).json({
      success: true,
      totalCreated: inserted.length,
      vouchers: inserted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   GET ALL VOUCHERS
================================ */
const getAll = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   GET SINGLE VOUCHER
================================ */
const getByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const voucher = await Voucher.findOne({ voucherCode: code });

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    res.status(200).json(voucher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   REDEEM VOUCHER (CRITICAL)
================================ */
const redeem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      voucherCode,
      courseName,
      fullName,
      email,
      mobileNumber,
      userId,
    } = req.body;

    if (!voucherCode || !courseName || !fullName || !email || !mobileNumber) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔐 Find unused voucher
    const voucher = await Voucher.findOne(
      { voucherCode, isRedeemed: false },
      null,
      { session }
    );

    if (!voucher) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Invalid or already redeemed voucher" });
    }

    // ✅ Mark voucher as redeemed
    voucher.isRedeemed = true;
    voucher.redeemedAt = new Date();
    await voucher.save({ session });

    // ✅ Create order
    const order = await Order.create(
      [
        {
          user: userId,
          fullName,
          email,
          mobileNumber,
          courseName,
          voucher: voucher._id,
          voucherCode,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Voucher redeemed successfully",
      order: order[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ message: error.message });
  }
};

/* ================================
   UPDATE VOUCHER (ADMIN)
================================ */
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Voucher.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   DELETE VOUCHER
================================ */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Voucher.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    res.status(200).json({ message: "Voucher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generate, getAll, getByCode, redeem, update, remove };
