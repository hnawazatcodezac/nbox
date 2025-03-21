const { Router } = require("express");
const router = Router();
const { getReviews } = require("../../controllers/merchant/review.js");
const { verifyMerchantToken } = require("../../middlewares/authMiddleware.js");

router.get("/", verifyMerchantToken, getReviews);

module.exports = router;
