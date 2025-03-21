const { Router } = require("express");
const router = Router();
const {
  createCoupon,
  getCoupons,
  getCouponDetails,
} = require("../../controllers/merchant/coupon.js");
const { verifyMerchantToken } = require("../../middlewares/authMiddleware.js");
const { paramsValidator, bodyValidator } = require("../../middlewares/joi.js");

router.post(
  "/",
  verifyMerchantToken,
  bodyValidator("couponBodySchema"),
  createCoupon
);

router.get("/", verifyMerchantToken, getCoupons);

router.get(
  "/:couponId/details",
  verifyMerchantToken,
  paramsValidator("couponParamsSchema"),
  getCouponDetails
);


module.exports = router;
