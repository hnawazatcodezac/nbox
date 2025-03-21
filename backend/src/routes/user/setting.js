const { Router } = require("express");
const router = Router();
const { updateSettings } = require("../../controllers/user/setting.js");
const { bodyValidator } = require("../../middlewares/joi.js");
const { verifyToken } = require("../../middlewares/authMiddleware.js");

router.put(
  "/settings",
  verifyToken,
  bodyValidator("languageUpdateSchema"),
  updateSettings
);

module.exports = router;
