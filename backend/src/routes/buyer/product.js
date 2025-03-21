const { Router } = require("express");
const router = Router();
const { getProductDetails } = require("../../controllers/buyer/product.js");
const { verifyBuyerToken } = require("../../middlewares/authMiddleware.js");
const { paramsValidator } = require("../../middlewares/joi.js");

router.get(
  "/:productId/details",
  verifyBuyerToken,
  paramsValidator("productParamsSchema"),
  getProductDetails
);

module.exports = router;
