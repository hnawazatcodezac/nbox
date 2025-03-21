const Joi = require("joi");

module.exports = {
  couponBodySchema: Joi.object({
    name: Joi.string().trim().min(3).max(100).required().uppercase().messages({
      "string.base": "Coupon name must be a string",
      "string.empty": "Coupon name is required",
      "string.min": "Coupon name must be at least {#limit} characters long",
      "string.max": "Coupon name must not exceed {#limit} characters",
      "any.required": "Coupon name is required",
    }),

    description: Joi.string().trim().max(500).required().allow("").messages({
      "string.base": "Description must be a string",
      "string.max": "Description should not exceed {#limit} characters",
      "any.required": "Description is required",
    }),

    active: Joi.boolean().required().default(true).messages({
      "boolean.base": "Active must be true or false",
      "any.required": "Please specify whether the coupon is active or not",
    }),

    couponType: Joi.string()
      .valid("flat amount", "percentage", "free delivery", "buy one get one")
      .lowercase()
      .required()
      .messages({
        "string.base": "Coupon type must be a string",
        "any.only":
          "Coupon type must be 'flat amount', 'percentage', 'free delivery' or 'buy one get one'",
        "any.required": "Coupon type is required",
      }),

    discountValue: Joi.alternatives().conditional("couponType", {
      is: Joi.valid("flat amount", "percentage"),
      then: Joi.number().min(1).required().messages({
        "number.base": "Discount value must be a number",
        "number.min": "Discount value must be at least {#limit}",
        "any.required":
          "Discount value is required for 'flat amount' and 'percentage' coupons",
      }),
      otherwise: Joi.forbidden().messages({
        "any.unknown":
          "Discount value is not allowed for 'free delivery' and 'bye one get one free' coupons",
      }),
    }),

    minimumRequirement: Joi.number().min(1).optional().allow(null).messages({
      "number.base": "Minimum requirement must be a number",
      "number.min": "Minimum requirement must be at least {#limit}",
    }),

    usageLimit: Joi.number().min(1).required().messages({
      "number.base": "Usage limit must be a number",
      "number.min": "Usage limit must be at least {#limit}",
      "any.required": "Usage limit is required",
    }),

    startDate: Joi.date().iso().required().messages({
      "date.base": "Start date must be a valid date",
      "date.format": "Start date must be in ISO format (YYYY-MM-DD)",
      "any.required": "Start date is required",
    }),

    endDate: Joi.date()
      .iso()
      .greater(Joi.ref("startDate"))
      .required()
      .messages({
        "date.base": "End date must be a valid date",
        "date.greater": "End date must be after the start date",
        "date.format": "End date must be in ISO format (YYYY-MM-DD)",
        "any.required": "End date is required",
      }),
  }),

  couponStatusBodySchema: Joi.object({
    active: Joi.boolean().required().default(true).messages({
      "boolean.base": "Active must be true or false",
      "any.required": "Please specify whether the coupon is active or not",
    }),
  }),

  couponParamsSchema: Joi.object({
    couponId: Joi.string().length(24).hex().required().messages({
      "string.base": "Coupon is invalid",
      "string.empty": "Coupon is required",
      "string.length": "Coupon is invalid",
      "string.hex": "Coupon is invalid",
      "any.required": "Coupon is required",
    }),
  }),
};
