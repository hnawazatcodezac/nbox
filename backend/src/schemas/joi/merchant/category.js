const Joi = require("joi");

module.exports = {
  categoryParamsSchema: Joi.object({
    categoryId: Joi.string().length(24).hex().required().messages({
      "string.base": "Category is invalid",
      "string.empty": "Category is required",
      "string.length": "Category is invalid",
      "string.hex": "Category is invalid",
      "any.required": "Category is required",
    }),
  }),

  categorySchema: Joi.object({
    enName: Joi.string()
      .min(3)
      .max(20)
      .regex(/^[A-Za-z\s]+$/)
      .required()
      .trim()
      .messages({
        "string.base": "Category English name must be a string",
        "string.empty": "Category English name is required",
        "string.min":
          "Category English name must be at least {#limit} characters",
        "string.max":
          "Category English name must not exceed {#limit} characters",
        "string.pattern.base":
          "Category English name can only contain letters and spaces",
        "any.required": "Category English name is required",
      }),

    frName: Joi.string()
      .min(3)
      .max(20)
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/)
      .required()
      .trim()
      .messages({
        "string.base": "Category French name must be a string",
        "string.empty": "Category French name is required",
        "string.min":
          "Category French name must be at least {#limit} characters",
        "string.max":
          "Category French name must not exceed {#limit} characters",
        "string.pattern.base":
          "Category French name can only contain letters and spaces",
        "any.required": "Category French name is required",
      }),

    sort: Joi.number().required().messages({
      "number.base": "Sort must be a number",
      "any.required": "Sort is required",
    }),
  }),
};
