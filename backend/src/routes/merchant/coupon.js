const { Router } = require("express");
const router = Router();
const {
  createCoupon,
  getCoupons,
} = require("../../controllers/merchant/coupon.js");
const { verifyMerchantToken } = require("../../middlewares/authMiddleware.js");
const { paramsValidator, bodyValidator } = require("../../middlewares/joi.js");

router.post(
  "/",
  verifyMerchantToken,
  bodyValidator("couponBodySchema"),
  createCoupon
);

router.get("/", verifyAdminToken, getCoupons);

module.exports = router;
