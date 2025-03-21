const Joi = require("joi");

module.exports = {
  settingSchema: Joi.object({
    displayDeliveryTime: Joi.boolean().required().messages({
      "boolean.base": "Display delivery time must be a boolean",
      "any.required": "Display delivery is required",
    }),
    deliveryType: Joi.string().valid("none", "fixed").messages({
      "string.empty": "Delivery type is required",
      "string.valid": "Invalid delivery type",
    }),
    deliveryTime: Joi.number().min(0).messages({
      "number.base": "Delivery time must be a number",
      "number.min": "Delivery time cannot be negative",
    }),
    deliveryFixedCharges: Joi.number().min(0).messages({
      "number.base": "Delivery fixed charges must be a number",
      "number.min": "Delivery fixed charges cannot be negative",
    })
    .when("deliveryType", {
      is: "fixed",
      then: Joi.optional(),
      otherwise: Joi.forbidden().messages({
        "any.unknown":
          "Delivery fixed charges is not allowed when delivery type is none",
      }),
    }),
  }),
};
