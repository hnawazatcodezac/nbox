const Joi = require("joi");

module.exports = {
  searchQuerySchema: Joi.object({
    search: Joi.string().min(2).trim().required().messages({
      "string.base": "Search term must be a string",
      "string.empty": "Search term is required",
      "string.min": "Search term must be at least {#limit} characters",
      "any.required": "Search term is required",
    }),
    lat: Joi.number().optional().messages({
      "number.base": "Latitude must be a number",
    }),
    long: Joi.number().optional().messages({
      "number.base": "Longitude must be a number",
    }),
  }),

  searchParamsSchema: Joi.object({
    merchantId: Joi.string().length(24).hex().required().messages({
      "string.base": "Merchant is invalid",
      "string.empty": "Merchant is required",
      "string.length": "Merchant is invalid",
      "string.hex": "Merchant is invalid",
      "any.required": "Merchant is required",
    }),
  }),
};
