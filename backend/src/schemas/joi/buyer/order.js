const Joi = require("joi");

module.exports = {
  createOrderParamsSchema: Joi.object({
    cartId: Joi.string().length(24).hex().required().messages({
      "string.base": "Cart is invalid",
      "string.empty": "Cart is required",
      "string.length": "Cart is invalid",
      "string.hex": "Cart is invalid",
      "any.required": "Cart is required",
    }),
  }),

  getOrderParamsSchema: Joi.object({
    orderId: Joi.string().length(24).hex().required().messages({
      "string.base": "Order is invalid",
      "string.empty": "Order is required",
      "string.length": "Order is invalid",
      "string.hex": "Order is invalid",
      "any.required": "Order is required",
    }),
  }),

  orderBodySchema: Joi.object({
    addressId: Joi.string().length(24).hex().required().messages({
      "string.base": "Address is invalid",
      "string.empty": "Address is required",
      "string.length": "Address is invalid",
      "string.hex": "Address is invalid",
      "any.required": "Address is required",
    }),
    scheduleTime: Joi.date().iso().messages({
      "date.base": "Schedule time must be a valid date",
      "date.format": "Schedule time format is invalid",
    }),
  }),
};
