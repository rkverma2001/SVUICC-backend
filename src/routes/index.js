const express = require('express');
const router = express.Router();
const voucherRouter = require('./voucherRoutes');
const courseRouter = require('./courseRoutes');
const authRouter = require('./authRoutes'); // Import auth routes


router.use('/vouchers', voucherRouter);
router.use('/course', courseRouter);
router.use('/auth', authRouter); // Add this line to include auth routes

module.exports = router;