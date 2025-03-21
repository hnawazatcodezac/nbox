const { Router } = require("express");
const router = Router();
const {
  getAllStoresCarts,
  getStoreCartItems,
  createCartItem,
  updateCartItem,
  deleteCartItem,
  validateCheckoutItems,
  getCartDetails,
} = require("../../controllers/buyer/cart.js");
const { verifyBuyerToken } = require("../../middlewares/authMiddleware.js");
const { paramsValidator, bodyValidator } = require("../../middlewares/joi.js");

router.get("/all", verifyBuyerToken, getAllStoresCarts);

router.get(
  "/:merchantId",
  verifyBuyerToken,
  paramsValidator("cartParamsSchema"),
  getStoreCartItems
);

router.post(
  "/:merchantId",
  verifyBuyerToken,
  paramsValidator("cartParamsSchema"),
  bodyValidator("createCartItemSchema"),
  createCartItem
);

router.put(
  "/:merchantId",
  verifyBuyerToken,
  paramsValidator("cartParamsSchema"),
  bodyValidator("updateCartItemSchema"),
  updateCartItem
);

router.delete(
  "/:cartId",
  verifyBuyerToken,
  paramsValidator("deleteCartParamsSchema"),
  deleteCartItem
);

router.get(
  "/validate/:merchantId",
  verifyBuyerToken,
  paramsValidator("cartParamsSchema"),
  validateCheckoutItems
);

router.get(
  "/details/:merchantId",
  verifyBuyerToken,
  paramsValidator("cartParamsSchema"),
  getCartDetails
);

module.exports = router;
