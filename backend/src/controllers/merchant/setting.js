const MerchantConfig = require("../../models/merchantConfig");

const updateSettings = async (req, res) => {
  const { userId } = req.decoded;
  const { ...userSettings } = req.body;

  try {
    const updateData = {
      deliverySettings: {
        displayDeliveryTime: userSettings?.displayDeliveryTime,
        deliveryType: userSettings?.deliveryType
          ? userSettings?.deliveryType
          : undefined,
        deliveryTime: userSettings?.deliveryTime
          ? userSettings?.deliveryTime
          : undefined,
        fixedCharges: userSettings?.deliveryFixedCharges
          ? userSettings?.deliveryFixedCharges
          : undefined,
      },
    };

    await MerchantConfig.findOneAndUpdate(
      { merchantId: userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Merchant settings updated successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

module.exports = {
  updateSettings,
};
