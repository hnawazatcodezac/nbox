const Joi = require("joi");

module.exports = {
  reviewParamsSchema: Joi.object({
    reviewId: Joi.string().length(24).hex().required().messages({
      "string.base": "Review is invalid",
      "string.empty": "Review is required",
      "string.length": "Review is invalid",
      "string.hex": "Review is invalid",
      "any.required": "Review is required",
    }),
  }),

  reviewBodySchema: Joi.object({
    review: Joi.string().required().messages({
      "string.base": "Review must be a string",
      "string.empty": "Review is required",
      "any.required": "Review is required",
    }),
    rating: Joi.number().min(1).max(5).required().messages({
      "number.base": "Ratings must be a number",
      "number.min": "Ratings must be at least 1",
      "number.max": "Ratings cannot exceed 5",
      "any.required": "Ratings are required",
    }),
  }),
};
