const { Router } = require("express");
const router = Router();
const {
  addReview,
  getReview,
  updateReview,
  deleteReview,
} = require("../../controllers/buyer/review.js");
const { verifyBuyerToken } = require("../../middlewares/authMiddleware.js");
const { paramsValidator, bodyValidator } = require("../../middlewares/joi.js");

router.post(
  "/:orderId",
  verifyBuyerToken,
  paramsValidator("orderParamsSchema"),
  bodyValidator("reviewBodySchema"),
  addReview
);

router.get(
  "/:orderId",
  verifyBuyerToken,
  paramsValidator("orderParamsSchema"),
  getReview
);

router.put(
  "/:reviewId",
  verifyBuyerToken,
  paramsValidator("reviewParamsSchema"),
  bodyValidator("reviewBodySchema"),
  updateReview
);

router.delete(
  "/:reviewId",
  verifyBuyerToken,
  paramsValidator("reviewParamsSchema"),
  deleteReview
);

module.exports = router;
