const RedeemCode = require("../models/redeemCode");
const TalentUser = require("../models/talentUser");

const register = async (req, res) => {

  try {

    const { firstName, lastName, email, phone, redeemCode } = req.body;

    if (!firstName || !lastName || !email || !phone || !redeemCode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const code = await RedeemCode.findOne({ code: redeemCode });

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Invalid redeem code"
      });
    }

    if (code.used) {
      return res.status(400).json({
        success: false,
        message: "Code already used"
      });
    }

    const user = await TalentUser.create({
      firstName,
      lastName,
      email,
      phone,
      redeemCode
    });

    code.used = true;
    code.redeemedBy = user._id;

    await code.save();

    res.json({
      success: true,
      message: "Registration successful"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

module.exports = {register}