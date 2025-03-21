const Joi = require("joi");

module.exports = {
  buyerRegisterSchema: Joi.object({
    firstName: Joi.string()
      .min(1)
      .max(70)
      .pattern(/^[^\p{N}]/u)
      .required()
      .trim()
      .messages({
        "string.base": "First name must be a string",
        "string.pattern.base":
          "First name must start with a letter and can include numbers, spaces, but cannot be entirely numbers",
        "any.required": "First name is required",
        "string.min": "First name must be at least {#limit} characters long",
        "string.max": "First name must not exceed {#limit} characters",
        "string.empty": "First name is not allowed to be empty",
        "string.trim":
          "First name should not contain any spaces at the beginning or end",
      }),
    lastName: Joi.string()
      .min(1)
      .max(70)
      .pattern(/^[^\p{N}]/u)
      .trim()
      .required()
      .messages({
        "string.base": "Last name must be a string",
        "string.pattern.base":
          "Last name must start with a letter and can include numbers, spaces, but cannot be entirely numbers",
        "any.required": "Last name is required",
        "string.empty": "Last name is not allowed to be empty",
        "string.min": "Last name must be at least {#limit} characters long",
        "string.max": "Last name must not exceed {#limit} characters",
        "string.trim":
          "Last name should not contain any spaces at the beginning or end",
      }),
    email: Joi.string()
      .trim()
      .email({
        minDomainSegments: 2,
        tlds: { allow: false },
      })
      .required()
      .messages({
        "string.email": "Enter valid email",
        "any.required": "Email is required",
        "string.empty": "Email is not allowed to be empty",
        "string.trim":
          "Email should not contain any spaces at the beginning or end",
      }),
    password: Joi.string()
      .required()
      .min(6)
      .max(30)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{6,30}$/,
        "strong password"
      )
      .messages({
        "string.pattern.name":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "string.min": "Password must be at least {#limit} characters long",
        "string.max": "Password must be at most {#limit} characters long",
        "any.required": "Password is required",
        "string.empty": "Password is not allowed to be empty",
      }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9+\-]{10,15}$/)
      .optional()
      .allow("", null)
      .trim()
      .messages({
        "string.empty": "Phone number is not allowed to be empty",
        "string.pattern.base": "Phone number should be 10 to 15 digits",
        "string.trim":
          "Phone number may not contain any spaces at the beginning or end",
      }),
  }),

  merchantRegisterSchema: Joi.object({
    firstName: Joi.string()
      .min(1)
      .max(70)
      .pattern(/^[^\p{N}]/u)
      .required()
      .trim()
      .messages({
        "string.base": "First name must be a string",
        "string.pattern.base":
          "First name must start with a letter and can include numbers, spaces, but cannot be entirely numbers",
        "any.required": "First name is required",
        "string.min": "First name must be at least {#limit} characters long",
        "string.max": "First name must not exceed {#limit} characters",
        "string.empty": "First name is not allowed to be empty",
        "string.trim":
          "First name should not contain any spaces at the beginning or end",
      }),
    lastName: Joi.string()
      .min(1)
      .max(70)
      .pattern(/^[^\p{N}]/u)
      .trim()
      .required()
      .messages({
        "string.base": "Last name must be a string",
        "string.pattern.base":
          "Last name must start with a letter and can include numbers, spaces, but cannot be entirely numbers",
        "any.required": "Last name is required",
        "string.empty": "Last name is not allowed to be empty",
        "string.min": "Last name must be at least {#limit} characters long",
        "string.max": "Last name must not exceed {#limit} characters",
        "string.trim":
          "Last name should not contain any spaces at the beginning or end",
      }),
    email: Joi.string()
      .trim()
      .email({
        minDomainSegments: 2,
        tlds: { allow: false },
      })
      .required()
      .messages({
        "string.email": "Enter valid email",
        "any.required": "Email is required",
        "string.empty": "Email is not allowed to be empty",
        "string.trim":
          "Email should not contain any spaces at the beginning or end",
      }),
    password: Joi.string()
      .required()
      .min(6)
      .max(30)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{6,30}$/,
        "strong password"
      )
      .messages({
        "string.pattern.name":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "string.min": "Password must be at least {#limit} characters long",
        "string.max": "Password must be at most {#limit} characters long",
        "any.required": "Password is required",
        "string.empty": "Password is not allowed to be empty",
      }),
    storeName: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .pattern(/^(?=.*[A-Za-z])[A-Za-z0-9][A-Za-z0-9 \.\'\-\&\$\!@#]*$/)
      .required()
      .messages({
        "string.base": "Store name must be a string",
        "any.required": "Store name is required",
        "string.min": "Store name must be at least {#limit} characters long",
        "string.max": "Store name must not exceed {#limit} characters",
        "string.empty": "Store name cannot be empty",
        "string.pattern.base":
          "Store name must start with a letter or number, include at least one letter, and only use letters, numbers, or (.'-&$!@#)",
        "string.trim":
          "Store name should not contain spaces at the beginning or end",
      }),
    companyWebsite: Joi.string()
      .uri({ scheme: ["http", "https"] })
      .max(100)
      .trim()
      .optional()
      .allow("")
      .messages({
        "string.base": "Company website must be a valid URL",
        "string.uri": "Company website must be a valid URL with http or https",
        "string.max": "Company website must not exceed {#limit} characters",
      }),
    orderPerMonth: Joi.number().integer().min(1).optional().messages({
      "number.base": "Orders per month must be a number",
      "number.min": "Orders per month must be at least {#limit}",
    }),
    businessType: Joi.string()
      .valid("manufactures", "distribution")
      .required()
      .messages({
        "string.base": "Business Type must be a string",
        "any.only":
          "Business Type must be either 'manufactures' or 'distribution'",
        "any.required": "Business Type is required",
      }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9+\-]{10,15}$/)
      .optional()
      .allow("", null)
      .trim()
      .messages({
        "string.empty": "Phone number is not allowed to be empty",
        "string.pattern.base": "Phone number should be 10 to 15 digits",
        "string.trim":
          "Phone number may not contain any spaces at the beginning or end",
      }),
  }),

  verifyEmailSchema: Joi.object({
    userId: Joi.string().required().messages({
      "string.base": "User ID must be a string",
      "any.required": "User ID is required",
    }),
    code: Joi.string().required().messages({
      "string.base": "Code must be a string",
      "any.required": "Verification code is required",
    }),
  }),

  profileUpdateSchema: Joi.object({
    firstName: Joi.string()
      .min(1)
      .max(70)
      .pattern(/^[^\p{N}]/u)
      .required()
      .trim()
      .messages({
        "string.base": "First name must be a string",
        "string.pattern.base":
          "First name must start with a letter and can include numbers, spaces, but cannot be entirely numbers",
        "any.required": "First name is required",
        "string.min": "First name must be at least {#limit} characters long",
        "string.max": "First name must not exceed {#limit} characters",
        "string.empty": "First name is not allowed to be empty",
        "string.trim":
          "First name should not contain any spaces at the beginning or end",
      }),
    lastName: Joi.string()
      .min(1)
      .max(70)
      .pattern(/^[^\p{N}]/u)
      .trim()
      .required()
      .messages({
        "string.base": "Last name must be a string",
        "string.pattern.base":
          "Last name must start with a letter and can include numbers, spaces, but cannot be entirely numbers",
        "any.required": "Last name is required",
        "string.empty": "Last name is not allowed to be empty",
        "string.min": "Last name must be at least {#limit} characters long",
        "string.max": "Last name must not exceed {#limit} characters",
        "string.trim":
          "Last name should not contain any spaces at the beginning or end",
      }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9+\-]{10,15}$/)
      .optional()
      .allow("", null)
      .trim()
      .messages({
        "string.empty": "Phone number is not allowed to be empty",
        "string.pattern.base": "Phone number should be 10 to 15 digits",
        "string.trim":
          "Phone number may not contain any spaces at the beginning or end",
      }),
  }),

  passwordUpdateSchema: Joi.object().keys({
    currentPassword: Joi.string()
      .required()
      .min(6)
      .max(30)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{6,30}$/,
        "strong password"
      )
      .messages({
        "string.pattern.name":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "string.min": "Password must be at least {#limit} characters long",
        "string.max": "Password must be at most {#limit} characters long",
        "any.required": "Password is required",
        "string.empty": "Password is not allowed to be empty",
      }),
    newPassword: Joi.string()
      .required()
      .min(6)
      .max(30)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{6,30}$/,
        "strong password"
      )
      .messages({
        "string.pattern.name":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "string.min": "Password must be at least {#limit} characters long",
        "string.max": "Password must be at most {#limit} characters long",
        "any.required": "Password is required",
        "string.empty": "Password is not allowed to be empty",
      }),
    confirmPassword: Joi.string()
      .trim()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Password do not match",
      }),
  }),
};
