const User = require("../models/user");

const getAccessToken = async (req, res, next) => {
  try {
    const email = req.decoded.email;
    const user = await User.findOne({ email }, "accessToken");
    req.decoded = {
      ...req.decoded,
      accessToken: user?.accessToken,
    };
    next();
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: err?.response?.data || err.message,
    });
  }
};

module.exports = {
  getAccessToken,
};
