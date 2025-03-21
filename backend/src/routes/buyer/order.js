const { Router } = require("express");
const router = Router();
const {
  createCheckout,
  checkoutComplete,
  getAllOrders,
  getSingleOrder,
  orderDelivered,
  reorder,
} = require("../../controllers/buyer/order.js");
const { verifyBuyerToken } = require("../../middlewares/authMiddleware.js");
const { paramsValidator, bodyValidator } = require("../../middlewares/joi.js");

router.post(
  "/checkout/:cartId",
  verifyBuyerToken,
  paramsValidator("createOrderParamsSchema"),
  bodyValidator("orderBodySchema"),
  createCheckout
);

router.post("/checkout-complete", checkoutComplete);

router.get("/all", verifyBuyerToken, getAllOrders);

router.get(
  "/:orderId",
  verifyBuyerToken,
  paramsValidator("getOrderParamsSchema"),
  getSingleOrder
);

router.put(
  "/delivered/:orderId",
  verifyBuyerToken,
  paramsValidator("orderParamsSchema"),
  orderDelivered
);

router.post(
  "/reorder/:orderId",
  verifyBuyerToken,
  paramsValidator("orderParamsSchema"),
  reorder
);

module.exports = router;
