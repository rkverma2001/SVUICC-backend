const jwt = require("jsonwebtoken");

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Store mobile number from token
    req.user = {
      mobileNumber: decoded.mobileNumber,
      userId: decoded.userId, // optional
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token failed",
    });
  }
};