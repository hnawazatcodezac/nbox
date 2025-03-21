const { Router } = require("express");
const router = Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../../controllers/merchant/category.js");
const { verifyMerchantToken } = require("../../middlewares/authMiddleware");
const { bodyValidator, paramsValidator } = require("../../middlewares/joi.js");

router.post(
  "/",
  verifyMerchantToken,
  bodyValidator("categorySchema"),
  createCategory
);

router.get("/", verifyMerchantToken, getCategories);

router.put(
  "/:categoryId",
  verifyMerchantToken,
  paramsValidator("categoryParamsSchema"),
  bodyValidator("categorySchema"),
  updateCategory
);

router.delete(
  "/:categoryId",
  verifyMerchantToken,
  paramsValidator("categoryParamsSchema"),
  deleteCategory
);

module.exports = router;
