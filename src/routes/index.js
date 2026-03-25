const express = require('express');
const router = express.Router();
const voucherRouter = require('./voucherRoutes');
const courseRouter = require('./courseRoutes');
const authRouter = require('./authRoutes'); // Import auth routes
const talentRouter = require('./talentRoutes');
const orderRouter = require('./orderRoutes')


router.use('/vouchers', voucherRouter);
router.use('/course', courseRouter);
router.use('/auth', authRouter); // Add this line to include auth routes
router.use('/talent', talentRouter);
router.use('/orders', orderRouter);

module.exports = router;