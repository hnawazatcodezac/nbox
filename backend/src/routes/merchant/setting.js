const { Router } = require("express");
const router = Router();
const { updateSettings } = require("../../controllers/merchant/setting.js");
const { verifyMerchantToken } = require("../../middlewares/authMiddleware.js");
const { bodyValidator } = require("../../middlewares/joi.js");

router.put(
  "/",
  verifyMerchantToken,
  bodyValidator("settingSchema"),
  updateSettings
);

module.exports = router;
