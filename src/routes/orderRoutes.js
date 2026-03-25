const express = require("express");
const router = express.Router();

const {
  getMyOrders
} = require("../controllers/orderController");
const { protect } = require("../middlewares/auth");

router.get("/myorders", protect, getMyOrders);

module.exports = router;
