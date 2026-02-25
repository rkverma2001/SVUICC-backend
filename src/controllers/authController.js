const Otp = require("../models/otpModel");
const User = require("../models/userModel");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const springedge = require("springedge");
const dayjs = require("dayjs");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const sendOtp = async (req, res) => {
  const { mobile } = req.body;

  try {
    // Validate phone number
    if (!mobile) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    let otpRecord = await Otp.findOne({ mobile });

    if (!otpRecord) {
      otpRecord = new Otp({
        mobile,
        otp: hashedOtp,
        expiry: dayjs().tz("Asia/Kolkata").add(5, "minute"),
      });
    } else {
      otpRecord.otp = hashedOtp;
      otpRecord.expiry = dayjs().tz("Asia/Kolkata").add(5, "minute");
    }

    await otpRecord.save();

    const params = {
      sender: "ETREDU", // Sender Name
      apikey: process.env.SPRINGEDGE_API_KEY, // Your API Key
      to: [mobile], // Phone number
      message: `Hello Learner! Your OTP for EtrainIndia is ${otp}. This OTP is valid for 5 minutes.`,
      format: "json",
    };

    // Send OTP using SpringEdge
    springedge.messages.send(params, 5000, function (err, response) {
      if (err) {
        return res.status(500).json({ error: "Failed to send OTP" });
      }
      res.status(200).json({ message: `OTP sent successfully` });
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp, email, fullName } = req.body;

    // 1️⃣ Validation
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP are required",
      });
    }

    // 2️⃣ Find OTP record
    const otpRecord = await Otp.findOne({ mobile });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    // 3️⃣ Check expiry
    if (dayjs().isAfter(dayjs(otpRecord.expiry))) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // 4️⃣ Compare OTP
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 5️⃣ Find or Create User (🔥 LOGIN + SIGNUP LOGIC)
    let user = await User.findOne({ mobileNumber: mobile });

    if (!user) {
      user = await User.create({
        mobileNumber: mobile,
        email: email || undefined,
        fullName: fullName || undefined,
      });
    }

    // 6️⃣ Generate JWT (User data inside token)
    const token = jwt.sign(
      {
        userId: user._id,
        mobileNumber: user.mobileNumber,
        email: user.email || null,
        fullName: user.fullName || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // 7️⃣ Cleanup OTP
    await Otp.deleteOne({ mobile });

    // 8️⃣ Success Response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = { sendOtp, verifyOtp };
