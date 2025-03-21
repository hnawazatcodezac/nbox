const Review = require("../../models/review.js");

const getReviews = async (req, res) => {
  const { userId } = req.decoded;

  try {
    const reviews = await Review.find({ merchantId: userId })
    .populate("orderId","orderNumber")
    .populate("userId","firstName lastName");

    if (reviews.length === 0) {
      return res.status(404).json({
        message: "No reviews found",
        response: null,
        error: "No reviews found",
      });
    }

    const formattedReviews = reviews.map((review) => ({
      orderId: review.orderId?._id,
      review: review.review,
      rating: review.rating,
      orderNumber: review.orderId?.orderNumber,
      customerFirstName: review.userId?.firstName,
      customerLastName: review.userId?.lastName,
      time: review.updatedAt,
    }));

    const data = {
      data: formattedReviews,
    };
    return res.status(200).json({
      message: "Reviews retrieved successfully",
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

module.exports = {
  getReviews,
};
