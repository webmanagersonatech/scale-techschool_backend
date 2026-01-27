import Joi from "joi";

export const createWillingJoinerSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 2 characters",
  }),

  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be valid",
  }),

  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "any.required": "Phone number is required",
      "string.pattern.base": "Phone number must be a valid 10-digit Indian number",
    }),

  course: Joi.string().required().messages({
    "any.required": "Course is required",
    "string.empty": "Course cannot be empty",
  }),

  source: Joi.string().optional(),
});
