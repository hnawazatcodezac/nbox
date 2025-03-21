const UserSetting = require("../../models/userSetting");

const updateSettings = async (req, res) => {
  const { userId } = req.decoded;
  const { language } = req.body;

  try {
    await UserSetting.updateOne(
      { userId },
      { $set: { language } },
      { upsert: true }
    );

    const data = {
      language: language,
    };

    return res.status(200).json({
      message: "Language updated successfully",
      response: { data: data },
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error?.response?.data || error.message,
    });
  }
};

module.exports = {
  updateSettings,
};
