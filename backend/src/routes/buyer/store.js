const { Router } = require("express");
const router = Router();
const {
  getAllStores,
  getAllProducts,
} = require("../../controllers/buyer/store.js");
const { verifyBuyerToken } = require("../../middlewares/authMiddleware.js");
const { queryValidator, paramsValidator } = require("../../middlewares/joi.js");

router.get(
  "/",
  verifyBuyerToken,
  queryValidator("storeQuerySchema"),
  getAllStores
);

router.get(
  "/:merchantId",
  verifyBuyerToken,
  queryValidator("storeQuerySchema"),
  paramsValidator("storeParamsSchema"),
  getAllProducts
);

module.exports = router;
