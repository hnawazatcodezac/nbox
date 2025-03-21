const { Router } = require("express");
const router = Router();
const {
  createLabel,
  getLabels,
  updateLabel,
  deleteLabel,
} = require("../../controllers/merchant/label.js");
const { verifyMerchantToken } = require("../../middlewares/authMiddleware.js");
const { bodyValidator, paramsValidator } = require("../../middlewares/joi.js");

router.post(
  "/",
  verifyMerchantToken,
  bodyValidator("labelSchema"),
  createLabel
);

router.get("/", verifyMerchantToken, getLabels);

router.put(
  "/:labelId",
  verifyMerchantToken,
  paramsValidator("labelParamsSchema"),
  bodyValidator("labelSchema"),
  updateLabel
);

router.delete(
  "/:labelId",
  verifyMerchantToken,
  paramsValidator("labelParamsSchema"),
  deleteLabel
);

module.exports = router;
