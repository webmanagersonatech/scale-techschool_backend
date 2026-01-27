import Joi from "joi";

export const createContactSchema = Joi.object({
  firstName: Joi.string().required().messages({
    "string.empty": "First name is required",
  }),
  lastName: Joi.string().required().messages({
    "string.empty": "Last name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be 10-15 digits",
    }),
  subject: Joi.string().required().messages({
    "string.empty": "Subject is required",
  }),
  message: Joi.string().required().messages({
    "string.empty": "Message is required",
  }),
});
