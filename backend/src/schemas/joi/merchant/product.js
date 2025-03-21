const Joi = require("joi");

module.exports = {
  productParamsSchema: Joi.object({
    productId: Joi.string().length(24).hex().required().messages({
      "string.base": "Product is invalid",
      "string.empty": "Product is required",
      "string.length": "Product is invalid",
      "string.hex": "Product is invalid",
      "any.required": "Product is required",
    }),
  }),

  productQuerySchema: Joi.object({
    search: Joi.string().min(2).max(255).trim().optional().messages({
      "string.base": "Search must be a string",
      "string.min": "Search must be at least {#limit} characters",
      "string.max": "Search must not exceed {#limit} characters",
    }),
    page: Joi.number().integer().positive().optional().messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.positive": "Page must be a positive number",
    }),
    pageSize: Joi.number().integer().positive().optional().messages({
      "number.base": "Page size must be a number",
      "number.integer": "Page size must be an integer",
      "number.positive": "Page size must be a positive number",
    }),
  }),

  createProductSchema: Joi.object({
    enName: Joi.string()
      .min(3)
      .max(255)
      .trim()
      .pattern(
        /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9'’\-]+|\([a-zA-Z0-9'’\-]+\))(?: [a-zA-Z0-9'’\-\(\)]+)*$/
      )
      .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
      .required()
      .messages({
        "string.base": "English product name must be a string",
        "string.empty": "English product name is required",
        "string.min":
          "English product name must be at least {#limit} characters",
        "string.max":
          "English product name must not exceed {#limit} characters",
        "string.pattern.base":
          "English product name can only contain letters, numbers, hyphens, and apostrophes, and must start and end with letter or number",
        "any.required": "English product name is required",
      }),
    frName: Joi.string()
      .min(3)
      .max(255)
      .trim()
      .pattern(
        /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9À-ž'’\-]+|\([a-zA-Z0-9À-ž'’\-]+\))(?: [a-zA-Z0-9À-ž'’\-\(\)]+)*$/
      )
      .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
      .required()
      .messages({
        "string.base": "French product name must be a string",
        "string.empty": "French product name is required",
        "string.min":
          "French product name must be at least {#limit} characters",
        "string.max": "French product name must not exceed {#limit} characters",
        "string.pattern.base":
          "French product name can only contain letters, numbers, hyphens, and apostrophes, and must start and end with letter or number",
        "any.required": "French product name is required",
      }),

    sku: Joi.string()
      .pattern(/^[a-zA-Z0-9]+([_-][a-zA-Z0-9]+)*$/)
      .min(6)
      .max(15)
      .required()
      .messages({
        "string.base": "SKU must be a string",
        "string.pattern.base":
          "SKU must only contain letters, numbers, hyphens, or underscores",
        "string.min": "SKU must be at least {#limit} characters long",
        "string.max": "SKU must not exceed {#limit} characters",
        "any.required": "SKU is required",
        "string.empty": "SKU is not allowed to be empty",
      }),

    enDescription: Joi.string().trim().messages({
      "string.base": "English description must be a string",
      "string.empty": "English description is not allowed to be empty",
    }),

    frDescription: Joi.string().trim().messages({
      "string.base": "French description must be a string",
      "string.empty": "French description is not allowed to be empty",
    }),

    categories: Joi.string()
      .trim()
      .required()
      .pattern(/^([a-fA-F0-9]{24})(,[a-fA-F0-9]{24})*$/)
      .messages({
        "string.base": "Categories are not valid",
        "string.empty": "Categories are required",
        "string.pattern.base": "Categories are not valid",
        "any.required": "Categories are required",
      }),

    price: Joi.number().precision(2).positive().required().messages({
      "number.base": "Price must be number",
      "number.positive": "Price must be a positive number",
      "number.precision": "Price can have up to {#limit} decimal places",
      "any.required": "Price is required",
    }),

    costPrice: Joi.number().precision(2).positive().required().messages({
      "number.base": "Cost price must be a number",
      "number.positive": "Cost price must be a positive number",
      "number.precision": "Cost price can have up to {#limit} decimal places",
      "any.required": "Cost price is required",
    }),

    compareAtPrice: Joi.alternatives().conditional("costPrice", {
      is: Joi.number().positive().required().precision(2),
      then: Joi.number()
        .precision(2)
        .positive()
        .greater(Joi.ref("costPrice"))
        .required()
        .messages({
          "number.base": "Compare at price must be a number",
          "number.positive": "Compare at price must be a positive number",
          "number.precision":
            "Compare at price can have up to {#limit} decimal places",
          "number.greater": "Compare at price must be greater than Cost price",
          "any.required": "Compare at price is required",
        }),
      otherwise: Joi.forbidden().messages({
        "any.unknown":
          "Compare at price cannot be set because Cost price is missing or invalid",
      }),
    }),

    chargeTax: Joi.boolean().required().messages({
      "boolean.base": "Charge tax must be a boolean value",
      "any.required": "Charge tax is required",
    }),

    chargeTaxValue: Joi.number()
      .integer()
      .min(1)
      .when("chargeTax", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "Charge Tax Value cannot be set when Charge Tax is disabled",
        }),
      })
      .messages({
        "number.base": "Charge Tax Value must be a number",
        "number.integer": "Charge Tax Value must be an integer",
        "number.min": "Charge Tax Value cannot be negative",
        "any.required":
          "Charge Tax Value is required when Charge Tax is enabled",
      }),

    availability: Joi.string()
      .valid("in-stock", "out-of-stock")
      .required()
      .messages({
        "any.only": "Availability must be either 'In Stock' or 'Out of Stock'",
        "any.required": "Availability is required",
        "string.empty": "Availability is not allowed to be empty",
      }),

    status: Joi.string().valid("active", "in-active").required().messages({
      "any.only": "Status must be either 'active' or 'in-active'",
      "any.required": "Status is required",
      "string.empty": "Status is not allowed to be empty",
    }),

    orderQuantity: Joi.boolean().required().messages({
      "boolean.base": "Order quantity must be a boolean value",
      "any.required": "Order quantity is required",
    }),

    minQuantity: Joi.number()
      .integer()
      .min(1)
      .when("orderQuantity", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "Minimum quantity cannot be set when order quantity is disabled",
        }),
      })
      .messages({
        "number.base": "Minimum quantity must be a number",
        "number.integer": "Minimum quantity must be an integer",
        "number.min": "Minimum quantity must be at least {#limit}",
        "any.required":
          "Minimum quantity is required when order quantity is enabled",
      }),

    maxQuantity: Joi.alternatives().conditional("minQuantity", {
      is: Joi.number().positive().required(),
      then: Joi.number()
        .integer()
        .min(1)
        .greater(Joi.ref("minQuantity"))
        .messages({
          "number.base": "Maximum quantity must be a number",
          "number.integer": "Maximum quantity must be an integer",
          "number.min": "Maximum quantity must be at least 1",
          "number.greater":
            "Maximum quantity must be greater than Minimum quantity",
        }),
      otherwise: Joi.forbidden().messages({
        "any.unknown":
          "Maximum quantity cannot be set because Minimum quantity is missing or invalid",
      }),
    }),

    enableInventory: Joi.boolean().required().messages({
      "boolean.base": "Enable inventory must be a boolean value",
      "any.required": "Enable inventory is required",
    }),

    inventory: Joi.number()
      .integer()
      .min(0)
      .when("enableInventory", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown": "Inventory cannot be set when inventory is disabled",
        }),
      })
      .messages({
        "number.base": "Inventory must be a number",
        "number.integer": "Inventory must be an integer",
        "number.min": "Inventory must not be a negative number",
        "any.required": "Inventory is required when inventory is enabled",
      }),

    minQuantityThreshold: Joi.number().required().integer().min(1).messages({
      "number.base": "Min Quantity Threshhold must be a number",
      "number.integer": "Min Quantity Threshhold must be an integer",
      "number.min": "Min Quantity Threshhold must be a positive number",
      "any.required": "Min Quantity Threshhold is required",
    }),

    labels: Joi.string()
      .trim()
      .required()
      .pattern(/^([a-fA-F0-9]{24})(,[a-fA-F0-9]{24})*$/)
      .messages({
        "string.base": "Labels are not valid",
        "string.empty": "Labels are required",
        "string.pattern.base": "Labels are not valid",
        "any.required": "Labels are required",
      }),

    tags: Joi.string()
      .allow("")
      .pattern(/^([a-zA-Z0-9\s]+,?)*$/)
      .messages({
        "string.pattern.base": "Tags must contains only letters and numbers",
      }),

    enableOption: Joi.boolean().required().messages({
      "boolean.base": "Enable option must be a boolean value",
      "any.required": "Enable option is required",
    }),

    enOptionName: Joi.string()
      .min(3)
      .max(255)
      .when("enableOption", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "English option name cannot be set when Option is disabled",
        }),
      })
      .pattern(
        /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9'’\-]+|\([a-zA-Z0-9'’\-]+\))(?: [a-zA-Z0-9'’\-\(\)]+)*$/
      )
      .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
      .messages({
        "string.base": "English option name must be a string",
        "string.pattern.base":
          "English option name can only contain letters, numbers, parentheses, hyphens, and apostrophes, and must start and end with letter or number",
        "string.min":
          "English option name must be at least {#limit} characters",
        "string.max": "English option name must not exceed {#limit} characters",
        "string.empty": "English option name is required",
        "any.required":
          "English option name is required when option is enabled",
      }),

    frOptionName: Joi.string()
      .min(3)
      .max(255)
      .when("enableOption", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "French option name cannot be set when Option is disabled",
        }),
      })
      .pattern(
        /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9À-ž'’\-]+|\([a-zA-Z0-9À-ž'’\-]+\))(?: [a-zA-Z0-9À-ž'’\-\(\)]+)*$/
      )
      .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
      .messages({
        "string.base": "French option name must be a string",
        "string.pattern.base":
          "French option name can only contain letters, numbers, hyphens, and apostrophes, and must start and end with letter or number",
        "string.min": "French option name must be at least {#limit} characters",
        "string.max": "French option name must not exceed {#limit} characters",
        "string.empty": "French option name is required",
        "any.required": "French option name is required when option is enabled",
      }),

    optionType: Joi.string()
      .valid("single", "multiple")
      .when("enableOption", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown": "Option type cannot be set when Option is disabled",
        }),
      })
      .messages({
        "any.only": "Option type must be either 'single' or 'multiple'",
        "any.required": "Option type is required when option is enabled",
      }),

    optionRequired: Joi.boolean()
      .when("enableOption", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "Option required field name cannot be set when Option is disabled",
        }),
      })
      .messages({
        "boolean.base": "Option required field must be true or false",
        "any.required":
          "Option required field is mandatory when option is enabled",
      }),

    variants: Joi.array()
      .items(
        Joi.object({
          enVariantName: Joi.string()
            .min(1)
            .required()
            .pattern(
              /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9'’\-]+|\([a-zA-Z0-9'’\-]+\))(?: [a-zA-Z0-9'’\-\(\)]+)*$/
            )
            .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
            .messages({
              "string.base": "English variant name must be a string",
              "string.pattern.base":
                "English variant name can only contain letters, numbers, hyphens, and apostrophes, and must start and end with letter or number",
              "string.empty": "English variant name is required",
              "string.min": "English variant name must be at least 1 character",
              "any.required": "English variant name is required",
            }),
          frVariantName: Joi.string()
            .min(1)
            .required()
            .pattern(
              /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9À-ž'’\-]+|\([a-zA-Z0-9À-ž'’\-]+\))(?: [a-zA-Z0-9À-ž'’\-\(\)]+)*$/
            )
            .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
            .messages({
              "string.base": "French variant name must be a string",
              "string.pattern.base":
                "French variant name can only contain letters, numbers, hyphens, and apostrophes, and must start and end with letter or number",
              "string.empty": "French variant name is required",
              "string.min": "French variant name must be at least 1 character",
              "any.required": "French variant name is required",
            }),
          price: Joi.number().precision(2).positive().required().messages({
            "number.base": "Price must be a number",
            "number.positive": "Price must be a positive number",
            "number.precision": "Price can have up to {#limit} decimal places",
            "any.required": "Price is required",
          }),
          costPrice: Joi.number().precision(2).positive().required().messages({
            "number.base": "Cost price must be a number",
            "number.positive": "Cost price must be a positive number",
            "number.precision":
              "Cost price can have up to {#limit} decimal places",
            "any.required": "Cost price is required",
          }),
        })
      )
      .when("optionRequired", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "Variants name cannot be set when Option Required field is disabled",
        }),
      })
      .messages({
        "array.base": "Variants must be an array",
        "array.min": "At least one variant is required when option is enabled",
        "any.required": "Variants are required when option is enabled",
      }),
  }),

  updateProductSchema: Joi.object({
    enName: Joi.string()
      .min(3)
      .max(255)
      .trim()
      .pattern(
        /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9'’\-]+|\([a-zA-Z0-9'’\-]+\))(?: [a-zA-Z0-9'’\-\(\)]+)*$/
      )
      .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
      .required()
      .messages({
        "string.base": "English product name must be a string",
        "string.empty": "English product name is required",
        "string.min":
          "English product name must be at least {#limit} characters",
        "string.max":
          "English product name must not exceed {#limit} characters",
        "string.pattern.base":
          "English product name can only contain letters, numbers, hyphens, and apostrophes, and must start and end with letter or number",
        "any.required": "English product name is required",
      }),
    frName: Joi.string()
      .min(3)
      .max(255)
      .trim()
      .pattern(
        /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9À-ž'’\-]+|\([a-zA-Z0-9À-ž'’\-]+\))(?: [a-zA-Z0-9À-ž'’\-\(\)]+)*$/
      )
      .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
      .required()
      .messages({
        "string.base": "French product name must be a string",
        "string.empty": "French product name is required",
        "string.min":
          "French product name must be at least {#limit} characters",
        "string.max": "French product name must not exceed {#limit} characters",
        "string.pattern.base":
          "French product name can only contain letters, numbers, hyphens, and apostrophes, and must start and end with letter or number",
        "any.required": "French product name is required",
      }),

    sku: Joi.string()
      .pattern(/^[a-zA-Z0-9]+([_-][a-zA-Z0-9]+)*$/)
      .min(6)
      .max(15)
      .required()
      .messages({
        "string.base": "SKU must be a string",
        "string.pattern.base":
          "SKU must only contain letters, numbers, hyphens, or underscores",
        "string.min": "SKU must be at least {#limit} characters long",
        "string.max": "SKU must not exceed {#limit} characters",
        "any.required": "SKU is required",
        "string.empty": "SKU is not allowed to be empty",
      }),

    enDescription: Joi.string().trim().messages({
      "string.base": "English description must be a string",
      "string.empty": "English description is not allowed to be empty",
    }),

    frDescription: Joi.string().trim().messages({
      "string.base": "French description must be a string",
      "string.empty": "French description is not allowed to be empty",
    }),

    categories: Joi.string()
      .trim()
      .required()
      .pattern(/^([a-fA-F0-9]{24})(,[a-fA-F0-9]{24})*$/)
      .messages({
        "string.base": "Categories are not valid",
        "string.empty": "Categories are required",
        "string.pattern.base": "Categories are not valid",
        "any.required": "Categories are required",
      }),

    price: Joi.number().precision(2).positive().required().messages({
      "number.base": "Price must be number",
      "number.positive": "Price must be a positive number",
      "number.precision": "Price can have up to {#limit} decimal places",
      "any.required": "Price is required",
    }),

    costPrice: Joi.number().precision(2).positive().required().messages({
      "number.base": "Cost price must be a number",
      "number.positive": "Cost price must be a positive number",
      "number.precision": "Cost price can have up to {#limit} decimal places",
      "any.required": "Cost price is required",
    }),

    compareAtPrice: Joi.alternatives().conditional("costPrice", {
      is: Joi.number().positive().required().precision(2),
      then: Joi.number()
        .precision(2)
        .positive()
        .greater(Joi.ref("costPrice"))
        .required()
        .messages({
          "number.base": "Compare at price must be a number",
          "number.positive": "Compare at price must be a positive number",
          "number.precision":
            "Compare at price can have up to {#limit} decimal places",
          "number.greater": "Compare at price must be greater than Cost price",
          "any.required": "Compare at price is required",
        }),
      otherwise: Joi.forbidden().messages({
        "any.unknown":
          "Compare at price cannot be set because Cost price is missing or invalid",
      }),
    }),

    chargeTax: Joi.boolean().required().messages({
      "boolean.base": "Charge tax must be a boolean value",
      "any.required": "Charge tax is required",
    }),

    chargeTaxValue: Joi.number()
      .integer()
      .min(1)
      .when("chargeTax", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "Charge Tax Value cannot be set when Charge Tax is disabled",
        }),
      })
      .messages({
        "number.base": "Charge Tax Value must be a number",
        "number.integer": "Charge Tax Value must be an integer",
        "number.min": "Charge Tax Value cannot be negative",
        "any.required":
          "Charge Tax Value is required when Charge Tax is enabled",
      }),

    availability: Joi.string()
      .valid("in-stock", "out-of-stock")
      .required()
      .messages({
        "any.only": "Availability must be either 'In Stock' or 'Out of Stock'",
        "any.required": "Availability is required",
        "string.empty": "Availability is not allowed to be empty",
      }),

    status: Joi.string().valid("active", "in-active").required().messages({
      "any.only": "Status must be either 'active' or 'in-active'",
      "any.required": "Status is required",
      "string.empty": "Status is not allowed to be empty",
    }),

    orderQuantity: Joi.boolean().required().messages({
      "boolean.base": "Order quantity must be a boolean value",
      "any.required": "Order quantity is required",
    }),

    minQuantity: Joi.number()
      .integer()
      .min(1)
      .when("orderQuantity", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "Minimum quantity cannot be set when order quantity is disabled",
        }),
      })
      .messages({
        "number.base": "Minimum quantity must be a number",
        "number.integer": "Minimum quantity must be an integer",
        "number.min": "Minimum quantity must be at least {#limit}",
        "any.required":
          "Minimum quantity is required when order quantity is enabled",
      }),

    maxQuantity: Joi.alternatives().conditional("minQuantity", {
      is: Joi.number().positive().required(),
      then: Joi.number()
        .integer()
        .min(1)
        .greater(Joi.ref("minQuantity"))
        .messages({
          "number.base": "Maximum quantity must be a number",
          "number.integer": "Maximum quantity must be an integer",
          "number.min": "Maximum quantity must be at least 1",
          "number.greater":
            "Maximum quantity must be greater than Minimum quantity",
        }),
      otherwise: Joi.forbidden().messages({
        "any.unknown":
          "Maximum quantity cannot be set because Minimum quantity is missing or invalid",
      }),
    }),

    enableInventory: Joi.boolean().required().messages({
      "boolean.base": "Enable inventory must be a boolean value",
      "any.required": "Enable inventory is required",
    }),

    inventory: Joi.number()
      .integer()
      .min(0)
      .when("enableInventory", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown": "Inventory cannot be set when inventory is disabled",
        }),
      })
      .messages({
        "number.base": "Inventory must be a number",
        "number.integer": "Inventory must be an integer",
        "number.min": "Inventory must not be a negative number",
        "any.required": "Inventory is required when inventory is enabled",
      }),

    minQuantityThreshold: Joi.number().required().integer().min(1).messages({
      "number.base": "Min Quantity Threshhold must be a number",
      "number.integer": "Min Quantity Threshhold must be an integer",
      "number.min": "Min Quantity Threshhold must be a positive number",
      "any.required": "Min Quantity Threshhold is required",
    }),

    labels: Joi.string()
      .trim()
      .required()
      .pattern(/^([a-fA-F0-9]{24})(,[a-fA-F0-9]{24})*$/)
      .messages({
        "string.base": "Labels are not valid",
        "string.empty": "Labels are required",
        "string.pattern.base": "Labels are not valid",
        "any.required": "Labels are required",
      }),

    tags: Joi.string()
      .allow("")
      .pattern(/^([a-zA-Z0-9\s]+,?)*$/)
      .messages({
        "string.pattern.base": "Tags must contains only letters and numbers",
      }),

    oldImages: Joi.string()
      .trim()
      .optional()
      .allow("")
      .pattern(/^(https?:\/\/[^\s,]+)(,https?:\/\/[^\s,]+)*$/)
      .messages({
        "string.base":
          "Old images must be a comma-separated string of valid URLs",
        "string.pattern.base":
          "Each old image url must be a valid, separated by commas",
      }),

    enableOption: Joi.boolean().required().messages({
      "boolean.base": "Enable option must be a boolean value",
      "any.required": "Enable option is required",
    }),

    enOptionName: Joi.string()
      .min(3)
      .max(255)
      .when("enableOption", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "English option name cannot be set when Option is disabled",
        }),
      })
      .pattern(
        /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9'’\-]+|\([a-zA-Z0-9'’\-]+\))(?: [a-zA-Z0-9'’\-\(\)]+)*$/
      )
      .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
      .messages({
        "string.base": "English option name must be a string",
        "string.pattern.base":
          "English option name can only contain letters, numbers, parentheses, hyphens, and apostrophes, and must start and end with letter or number",
        "string.min":
          "English option name must be at least {#limit} characters",
        "string.max": "English option name must not exceed {#limit} characters",
        "string.empty": "English option name is required",
        "any.required":
          "English option name is required when option is enabled",
      }),

    frOptionName: Joi.string()
      .min(3)
      .max(255)
      .when("enableOption", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "French option name cannot be set when Option is disabled",
        }),
      })
      .pattern(
        /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9À-ž'’\-]+|\([a-zA-Z0-9À-ž'’\-]+\))(?: [a-zA-Z0-9À-ž'’\-\(\)]+)*$/
      )
      .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
      .messages({
        "string.base": "French option name must be a string",
        "string.pattern.base":
          "French option name can only contain letters, numbers, hyphens, and apostrophes, and must start and end with letter or number",
        "string.min": "French option name must be at least {#limit} characters",
        "string.max": "French option name must not exceed {#limit} characters",
        "string.empty": "French option name is required",
        "any.required": "French option name is required when option is enabled",
      }),

    optionType: Joi.string()
      .valid("single", "multiple")
      .when("enableOption", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown": "Option type cannot be set when Option is disabled",
        }),
      })
      .messages({
        "any.only": "Option type must be either 'single' or 'multiple'",
        "any.required": "Option type is required when option is enabled",
      }),

    optionRequired: Joi.boolean()
      .when("enableOption", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "Option required field name cannot be set when Option is disabled",
        }),
      })
      .messages({
        "boolean.base": "Option required field must be true or false",
        "any.required":
          "Option required field is mandatory when option is enabled",
      }),

    variants: Joi.array()
      .items(
        Joi.object({
          variantId: Joi.string()
            .trim()
            .pattern(/^([a-fA-F0-9]{24})(,[a-fA-F0-9]{24})*$/)
            .messages({
              "string.base": "Variant is not valid",
              "string.pattern.base": "Variant is not valid",
            }),
          enVariantName: Joi.string()
            .min(1)
            .required()
            .pattern(
              /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9'’\-]+|\([a-zA-Z0-9'’\-]+\))(?: [a-zA-Z0-9'’\-\(\)]+)*$/
            )
            .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
            .messages({
              "string.base": "English variant name must be a string",
              "string.pattern.base":
                "English variant name can only contain letters, numbers, hyphens, and apostrophes, and must start and end with letter or number",
              "string.empty": "English variant name is required",
              "string.min": "English variant name must be at least 1 character",
              "any.required": "English variant name is required",
            }),
          frVariantName: Joi.string()
            .min(1)
            .required()
            .pattern(
              /^(?=.*[a-zA-Z])(?:[a-zA-Z0-9À-ž'’\-]+|\([a-zA-Z0-9À-ž'’\-]+\))(?: [a-zA-Z0-9À-ž'’\-\(\)]+)*$/
            )
            .pattern(/^(?!['’'-])(?!(.*(['’'-]){2,}))(?!.*['’'-]$).*[^'’'-]$/)
            .messages({
              "string.base": "French variant name must be a string",
              "string.pattern.base":
                "French variant name can only contain letters, numbers, hyphens, and apostrophes, and must start and end with letter or number",
              "string.empty": "French variant name is required",
              "string.min": "French variant name must be at least 1 character",
              "any.required": "French variant name is required",
            }),
          price: Joi.number().precision(2).positive().required().messages({
            "number.base": "Price must be a number",
            "number.positive": "Price must be a positive number",
            "number.precision": "Price can have up to {#limit} decimal places",
            "any.required": "Price is required",
          }),
          costPrice: Joi.number().precision(2).positive().required().messages({
            "number.base": "Cost price must be a number",
            "number.positive": "Cost price must be a positive number",
            "number.precision":
              "Cost price can have up to {#limit} decimal places",
            "any.required": "Cost price is required",
          }),
        })
      )
      .custom((variants, helpers) => {
        const variantIds = variants
          .map((variant) => variant.variantId)
          .filter((id) => id !== undefined);
        const uniqueVariantIds = new Set(variantIds);

        if (variantIds.length !== uniqueVariantIds.size) {
          return helpers.error("array.unique", { field: "variantId" });
        }
        return variants;
      })
      .when("optionRequired", {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden().messages({
          "any.unknown":
            "Variants name cannot be set when Option Required field is disabled",
        }),
      })
      .messages({
        "array.base": "Variants must be an array",
        "array.min": "At least one variant is required when option is enabled",
        "any.required": "Variants are required when option is enabled",
        "array.unique": "Each variant must have a unique variant ID",
      }),
  }),

  updateAvailabilitySchema: Joi.object({
    availability: Joi.string()
      .valid("in-stock", "out-of-stock")
      .required()
      .messages({
        "any.only": "Availability must be either 'In Stock' or 'Out of Stock'",
        "any.required": "Availability is required",
        "string.empty": "Availability is not allowed to be empty",
      }),
  }),
};
