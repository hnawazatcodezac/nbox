const Joi = require("joi");

module.exports = {
  languageUpdateSchema: Joi.object({
    language: Joi.string().min(2).max(10).required().messages({
      "string.base": "Language must be a string",
      "any.required": "Language is required",
      "string.empty": "Language cannot be empty",
      "string.min": "Language must be at least {#limit} characters long",
      "string.max": "Language must not exceed {#limit} characters",
    }),
  }),
};
