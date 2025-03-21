const Joi = require("joi");

module.exports = {
  labelParamsSchema: Joi.object({
    labelId: Joi.string().length(24).hex().required().messages({
      "string.base": "Label is invalid",
      "string.empty": "Label is required",
      "string.length": "Label is invalid",
      "string.hex": "Label is invalid",
      "any.required": "Label is required",
    }),
  }),

  labelSchema: Joi.object({
    enName: Joi.string()
      .min(3)
      .max(20)
      .required()
      .trim()
      .custom((value) => value.replace(/\s+/g, " ").trim())
      .regex(/^(?!.*(?:[-']{2,}))[A-Za-z]+(?:[-' ][A-Za-z]+)*$/)
      .messages({
        "string.base": "Label English name must be a string",
        "string.empty": "Label English name is required",
        "string.min": "Label English name must be at least {#limit} characters",
        "string.max": "Label English name must not exceed {#limit} characters",
        "string.pattern.base":
          "Label English name can only contain letters, spaces, hyphens, and apostrophes and must start with letter",
        "any.required": "Label English name is required",
      }),

    frName: Joi.string()
      .min(3)
      .max(20)
      .required()
      .trim()
      .custom((value) => value.replace(/\s+/g, " ").trim())
      .regex(/^(?!.*(?:[-']{2,}))[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-' ][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/)
      .messages({
        "string.base": "Label French name must be a string",
        "string.empty": "Label French name is required",
        "string.min": "Label French name must be at least {#limit} characters",
        "string.max": "Label French name must not exceed {#limit} characters",
        "string.pattern.base":
          "Label French name can only contain letters, spaces, hyphens, and apostrophes and must start with letter",
        "any.required": "Label French name is required",
      }),
  }),
};
