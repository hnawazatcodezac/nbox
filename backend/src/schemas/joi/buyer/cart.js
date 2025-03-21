const Joi = require("joi");

module.exports = {
  cartParamsSchema: Joi.object({
    merchantId: Joi.string().length(24).hex().required().messages({
      "string.base": "Merchant is invalid",
      "string.empty": "Merchant is required",
      "string.length": "Merchant is invalid",
      "string.hex": "Merchant is invalid",
      "any.required": "Merchant is required",
    }),
  }),

  deleteCartParamsSchema: Joi.object({
    cartId: Joi.string().length(24).hex().required().messages({
      "string.base": "Cart is invalid",
      "string.empty": "Cart is required",
      "string.length": "Cart is invalid",
      "string.hex": "Cart is invalid",
      "any.required": "Cart is required",
    }),
  }),

  createCartItemSchema: Joi.object({
    productId: Joi.string().length(24).hex().required().messages({
      "string.base": "Product is invalid",
      "string.empty": "Product is required",
      "string.length": "Product is invalid",
      "string.hex": "Product is invalid",
      "any.required": "Product is required",
    }),
    variantId: Joi.string().length(24).hex().optional().messages({
      "string.base": "Variant is invalid",
      "string.length": "Variant is invalid",
      "string.hex": "Variant is invalid",
    }),
    quantity: Joi.number().integer().min(1).required().messages({
      "number.base": "Quantity is invalid",
      "number.empty": "Quantity is required",
      "number.min": "Quantity must be greater than {#limit}",
      "any.required": "Quantity is required",
    }),
  }),

  updateCartItemSchema: Joi.object({
    productId: Joi.string().length(24).hex().required().messages({
      "string.base": "Product is invalid",
      "string.empty": "Product is required",
      "string.length": "Product is invalid",
      "string.hex": "Product is invalid",
      "any.required": "Product is required",
    }),
    variantId: Joi.string().length(24).hex().optional().messages({
      "string.base": "Variant is invalid",
      "string.length": "Variant is invalid",
      "string.hex": "Variant is invalid",
    }),
    quantity: Joi.number().integer().min(0).required().messages({
      "number.base": "Quantity is invalid",
      "number.empty": "Quantity is required",
      "number.min": "Quantity must not be in negative",
      "any.required": "Quantity is required",
    }),
  }),
};
