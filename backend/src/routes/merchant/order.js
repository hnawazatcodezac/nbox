const { Router } = require("express");
const router = Router();
const {
  getAllOrders,
  getScheduledOrders,
  getOrderDetails,
  acceptOrder,
  cancelOrder,
  prepareOrder,
  readyOrder,
  completeOrder,
} = require("../../controllers/merchant/order.js");
const { verifyMerchantToken } = require("../../middlewares/authMiddleware.js");
const {
  queryValidator,
  paramsValidator,
  bodyValidator,
} = require("../../middlewares/joi.js");

router.get(
  "/all",
  verifyMerchantToken,
  queryValidator("orderQuerySchema"),
  getAllOrders
);

router.get(
  "/scheduled",
  verifyMerchantToken,
  queryValidator("orderQuerySchema"),
  getScheduledOrders
);

router.get(
  "/:orderId",
  verifyMerchantToken,
  paramsValidator("orderParamsSchema"),
  getOrderDetails
);

router.put(
  "/accept/:orderId",
  verifyMerchantToken,
  paramsValidator("orderParamsSchema"),
  acceptOrder
);

router.put(
  "/cancel/:orderId",
  verifyMerchantToken,
  paramsValidator("orderParamsSchema"),
  cancelOrder
);

router.put(
  "/prepare/:orderId",
  verifyMerchantToken,
  paramsValidator("orderParamsSchema"),
  bodyValidator("prepareOrderBodySchema"),
  prepareOrder
);

router.put(
  "/ready/:orderId",
  verifyMerchantToken,
  paramsValidator("orderParamsSchema"),
  readyOrder
);

router.put(
  "/complete/:orderId",
  verifyMerchantToken,
  paramsValidator("orderParamsSchema"),
  completeOrder
);

module.exports = router;
