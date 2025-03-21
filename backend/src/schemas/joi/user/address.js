const Joi = require("joi");

module.exports = {
  addressParamsSchema: Joi.object({
    addressId: Joi.string().length(24).hex().required().messages({
      "string.base": "Address is invalid",
      "string.empty": "Address is required",
      "string.length": "Address is invalid",
      "string.hex": "Address is invalid",
      "any.required": "Address is required",
    }),
  }),

  userAddressSchema: Joi.object({
    city: Joi.string()
      .pattern(
        /^[A-Za-z](?=.*[A-Za-z])(?!.*\s{2,})(?!.*([-])\1)[A-Za-z0-9\s-]+$/
      )
      .min(1)
      .max(50)
      .required()
      .trim()
      .messages({
        "string.base": "City must be a string",
        "any.required": "City is required",
        "string.empty": "City cannot be empty",
        "string.min": "City must be at least {#limit} character long",
        "string.max": "City must not exceed {#limit} characters",
        "string.pattern.base":
          "Invalid city! Please enter a valid city without extra spaces or special characters",
      }),
    state: Joi.string()
      .pattern(
        /^[A-Za-z](?=.*[A-Za-z])(?!.*\s{2,})(?!.*([-])\1)[A-Za-z0-9\s-]+$/
      )
      .min(1)
      .max(50)
      .required()
      .trim()
      .messages({
        "string.base": "State must be a string",
        "any.required": "State is required",
        "string.empty": "State cannot be empty",
        "string.min": "State must be at least {#limit} character long",
        "string.max": "State must not exceed {#limit} characters",
        "string.pattern.base":
          "Invalid state! Please enter a valid state without extra spaces or special characters",
      }),
    country: Joi.string()
      .pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ](?!.*[\s'-]{2,})[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
      .min(2)
      .max(40)
      .required()
      .trim()
      .messages({
        "string.base": "Country must be a string",
        "any.required": "Country is required",
        "string.empty": "Country cannot be empty",
        "string.min": "Country must be at least {#limit} character long",
        "string.max": "Country must not exceed {#limit} characters",
        "string.pattern.base":
          "Invalid country! Please enter a valid country without numbers, extra spaces or special characters",
      }),
    postalCode: Joi.string()
      .pattern(/^(?!.*[\s-]{2,})[A-Za-z0-9\s-]{3,10}$/)
      .min(3)
      .max(10)
      .required()
      .trim()
      .messages({
        "string.base": "Postal code must be a string",
        "any.required": "Postal code is required",
        "string.empty": "Postal code cannot be empty",
        "string.min": "Postal code must be at least {#limit} character long",
        "string.max": "Postal code must not exceed {#limit} characters",
        "string.pattern.base": "Postal code must be valid",
      }),
    address: Joi.string()
      .pattern(
        /^(?!.*\s{2,})(?!.*([,#\-/().'])[\s]*[,#\-/().'])[A-Za-z0-9\s,#\-/().']+$/
      )
      .min(2)
      .max(255)
      .required()
      .trim()
      .messages({
        "string.base": "Address must be a string",
        "any.required": "Address is required",
        "string.empty": "Address cannot be empty",
        "string.min": "Address must be at least {#limit} character long",
        "string.max": "Address must not exceed {#limit} characters",
        "string.pattern.base":
          "Invalid adress! Please enter a valid adress without extra spaces or special characters",
      }),
    addressLatitude: Joi.number().min(-90).max(90).required().messages({
      "number.base": "Address Latitude must be a number",
      "number.min": "Address Latitude must be at least {#limit}",
      "number.max": "Address Latitude must be at most {#limit}",
      "any.required": "Address Latitude is required",
    }),
    addressLongitude: Joi.number().min(-180).max(180).required().messages({
      "number.base": "Address Longitude must be a number",
      "number.min": "Address Longitude must be at least {#limit}",
      "number.max": "Address Longitude must be at most {#limit}",
      "any.required": "Address Longitude is required",
    }),
    landmark: Joi.string()
      .pattern(
        /^(?!.*\s{2,})(?!.*([,#\-/().'])[\s]*[,#\-/().'])[A-Za-z0-9\s,#\-/().']+$/
      )
      .min(1)
      .max(255)
      .required()
      .trim()
      .messages({
        "string.base": "Landmark must be a string",
        "any.required": "Landmark is required",
        "string.empty": "Landmark cannot be empty",
        "string.min": "Landmark must be at least {#limit} character long",
        "string.max": "Landmark must not exceed {#limit} characters",
        "string.pattern.base":
          "Invalid landmark! Please enter a valid landmark without extra spaces or special characters",
      }),
    landmarkLatitude: Joi.number().min(-90).max(90).required().messages({
      "number.base": "Landmark Latitude must be a number",
      "number.min": "Landmark Latitude must be at least {#limit}",
      "number.max": "Landmark Latitude must be at most {#limit}",
      "any.required": "Landmark Latitude is required",
    }),
    landmarkLongitude: Joi.number().min(-180).max(180).required().messages({
      "number.base": "Landmark Longitude must be a number",
      "number.min": "Landmark Longitude must be at least {#limit}",
      "number.max": "Landmark Longitude must be at most {#limit}",
      "any.required": "Landmark Longitude is required",
    }),
    addressType: Joi.string()
      .valid("home", "office", "other")
      .required()
      .messages({
        "any.only": "Invalid Address Type",
        "any.empty": "Address Type must not be empty",
        "any.required": "Address Type is required",
      }),
    isDefault: Joi.boolean().required().messages({
      "boolean.base": "isDefault must be a boolean",
      "any.required": "isDefault is required",
    }),
  }),
};
