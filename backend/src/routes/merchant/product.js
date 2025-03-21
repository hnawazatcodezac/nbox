const { Router } = require("express");
const router = Router();
const {
  createProduct,
  getProducts,
  getProductsDetails,
  updateAvailability,
  updateProduct,
  deleteProduct,
} = require("../../controllers/merchant/product.js");
const { verifyMerchantToken } = require("../../middlewares/authMiddleware");
const { upload, validateFile } = require("../../middlewares/fileValidation.js");
const {
  bodyValidator,
  paramsValidator,
  queryValidator,
} = require("../../middlewares/joi.js");
const variantValidation = require("../../middlewares/variantValidation.js");

router.post(
  "/",
  verifyMerchantToken,
  upload.array("productImages"),
  validateFile("createProduct"),
  variantValidation,
  bodyValidator("createProductSchema"),
  createProduct
);

router.get(
  "/",
  verifyMerchantToken,
  queryValidator("productQuerySchema"),
  getProducts
);

router.get(
  "/details/:productId",
  verifyMerchantToken,
  paramsValidator("productParamsSchema"),
  getProductsDetails
);

router.put(
  "/availability/:productId",
  verifyMerchantToken,
  paramsValidator("productParamsSchema"),
  bodyValidator("updateAvailabilitySchema"),
  updateAvailability
);

router.put(
  "/:productId",
  verifyMerchantToken,
  paramsValidator("productParamsSchema"),
  upload.array("productImages"),
  validateFile("updateProduct"),
  variantValidation,
  bodyValidator("updateProductSchema"),
  updateProduct
);

router.delete(
  "/:productId",
  verifyMerchantToken,
  paramsValidator("productParamsSchema"),
  deleteProduct
);

module.exports = router;
