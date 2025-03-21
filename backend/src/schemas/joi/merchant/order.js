const Joi = require("joi");

module.exports = {
  orderQuerySchema: Joi.object({
    search: Joi.number().integer().positive().optional().messages({
      "number.base": "Search must be a number",
      "number.integer": "Search must be an integer",
      "number.positive": "Search must be a positive number",
    }),
    status: Joi.string()
      .valid(
        "pending",
        "accepted",
        "preparing",
        "out-for-delivery",
        "delivered",
        "completed",
        "canceled"
      )
      .optional()
      .messages({
        "string.base": "Status must be a string",
        "string.empty": "Status is not allowed to be empty",
        "any.only":
          "Status must be one of pending, accepted, preparing, out-for-delivery, delivered, completed or canceled",
      }),
    page: Joi.number().integer().positive().optional().messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.positive": "Page must be a positive number",
    }),
    pageSize: Joi.number().integer().positive().optional().messages({
      "number.base": "Page size must be a number",
      "number.integer": "Page size must be an integer",
      "number.positive": "Page size must be a positive number",
    }),
  }),

  orderParamsSchema: Joi.object({
    orderId: Joi.string().length(24).hex().required().messages({
      "string.base": "Order is invalid",
      "string.empty": "Order is required",
      "string.length": "Order is invalid",
      "string.hex": "Order is invalid",
      "any.required": "Order is required",
    }),
  }),

  prepareOrderBodySchema: Joi.object({
    preparationTime: Joi.number().integer().positive().required().messages({
      "number.base": "Preparation time must be a number",
      "number.integer": "Preparation time must be an integer",
      "number.positive": "Preparation time must be in postive integers",
      "any.required": "Preparation time is required",
    }),
  }),
};
