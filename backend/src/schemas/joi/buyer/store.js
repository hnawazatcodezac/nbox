const Joi = require("joi");

module.exports = {
  storeQuerySchema: Joi.object({
    lat: Joi.number().optional().messages({
      "number.base": "Latitude must be a number",
    }),
    long: Joi.number().optional().messages({
      "number.base": "Longitude must be a number",
    }),
  }),

  storeParamsSchema: Joi.object({
    merchantId: Joi.string().length(24).hex().required().messages({
      "string.base": "Store is invalid",
      "string.empty": "Store is required",
      "string.length": "Store is invalid",
      "string.hex": "Store is invalid",
      "any.required": "Store is required",
    }),
  }),
};
