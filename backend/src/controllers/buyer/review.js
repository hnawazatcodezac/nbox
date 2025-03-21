const Review = require("../../models/review.js");
const Order = require("../../models/order.js");

const addReview = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;
  const { rating, review } = req.body;

  try {
    const order = await Order.findOne({ _id: orderId, buyerId: userId })
      .select("orderStatus merchantId")
      .lean();
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        response: null,
        error: "Order not found",
      });
    }

    if (!["delivered", "completed"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "You can only review completed orders",
        response: null,
        error: "You can only review completed orders",
      });
    }

    const existingReview = await Review.findOne({ orderId, userId });
    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this product",
        response: null,
        error: "You have already reviewed this product",
      });
    }

    await Review.create({
      orderId,
      merchantId: order.merchantId,
      userId,
      rating,
      review,
    });

    return res.status(201).json({
      message: "Review added successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

const getReview = async (req, res) => {
  const { userId } = req.decoded;
  const { orderId } = req.params;

  try {
    const existingReview = await Review.findOne({ orderId, userId });
    if (!existingReview) {
      return res.status(404).json({
        message: "Review not found",
        response: null,
        error: "Review not found",
      });
    }

    const data = {
      data: {
        reviewId: existingReview?._id,
        review: existingReview?.review,
        rating: existingReview?.rating,
      },
    };

    return res.status(200).json({
      message: "Review retrieved successfully",
      response: data,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  const { userId } = req.decoded;
  const { reviewId } = req.params;
  const { rating, review } = req.body;

  try {
    const existingReview = await Review.findOne({ _id: reviewId, userId });
    if (!existingReview) {
      return res.status(404).json({
        message: "Review not found",
        response: null,
        error: "Review not found",
      });
    }

    await Review.findByIdAndUpdate(reviewId, {
      rating,
      review,
    });

    return res.status(200).json({
      message: "Review updated successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  const { userId } = req.decoded;
  const { reviewId } = req.params;

  try {
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
        response: null,
        error: "Review not found",
      });
    }

    return res.status(200).json({
      message: "Review deleted successfully",
      response: null,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      response: null,
      error: error.message,
    });
  }
};

module.exports = {
  addReview,
  getReview,
  updateReview,
  deleteReview,
};
