const { Router } = require("express");
const router = Router();
const {
  globalSearch,
  getStoreSearchProducts,
} = require("../../controllers/buyer/search.js");
const { verifyBuyerToken } = require("../../middlewares/authMiddleware.js");
const { paramsValidator, queryValidator } = require("../../middlewares/joi.js");

router.get(
  "/global",
  verifyBuyerToken,
  queryValidator("searchQuerySchema"),
  globalSearch
);

router.get(
  "/store/:merchantId/query",
  verifyBuyerToken,
  paramsValidator("searchParamsSchema"),
  queryValidator("searchQuerySchema"),
  getStoreSearchProducts
);

module.exports = router;
