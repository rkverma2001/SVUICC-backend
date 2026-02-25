const express = require("express");
const { generate, getAll, getByCode, redeem, update, remove } = require("../controllers/voucherController.js");

const router = express.Router();

router.post("/generate", generate);
router.get("/", getAll);
router.get("/:code", getByCode);
router.post("/redeem", redeem);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;