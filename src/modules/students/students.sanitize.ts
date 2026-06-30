import Joi from 'joi';

export const createStudentSchema = Joi.object({
  studentScaleId: Joi.string().required().trim(),
  name: Joi.string().required().trim().pattern(/^[a-zA-Z\s]+$/, 'letters and spaces only'),
  phone: Joi.string().required().trim().pattern(/^[6-9][0-9]{9}$/, 'must start with 6,7,8,9 and be exactly 10 digits'),
  email: Joi.string().email().required().lowercase().trim(),
  studentFeedback: Joi.string().allow('', null).default(''),
  trainerFeedback: Joi.string().allow('', null).default(''),
  subjectWiseScores: Joi.array().items(
    Joi.object({
      subjectName: Joi.string().required().trim(),
      score: Joi.number().min(0).max(100).required(),
    })
  ).default([]),
  events: Joi.string().required().trim(),
  date: Joi.string().required().trim(),
  overallScore: Joi.number().min(0).max(100).default(0),
  overallAttendance: Joi.number().min(0).max(100).default(0),
  specialisation: Joi.string().required().trim().valid('Marketing', 'Finance', 'HR/Operations', 'Analytics'),
  badge: Joi.string().required().trim().valid('gold', 'silver', 'bronze'),
  photo: Joi.string().required().trim().pattern(/^data:image\/(jpeg|png|gif|bmp|webp);base64,/, 'valid base64 image'),
  aadharNumber: Joi.string().allow('', null).trim().pattern(/^[0-9]{12}$/, 'must be exactly 12 digits'),
});

export const updateStudentSchema = Joi.object({
  studentScaleId: Joi.string().trim(),
  name: Joi.string().trim().pattern(/^[a-zA-Z\s]+$/, 'letters and spaces only'),
  phone: Joi.string().trim().pattern(/^[6-9][0-9]{9}$/, 'must start with 6,7,8,9 and be exactly 10 digits'),
  email: Joi.string().email().lowercase().trim(),
  studentFeedback: Joi.string().allow('', null),
  trainerFeedback: Joi.string().allow('', null),
  subjectWiseScores: Joi.array().items(
    Joi.object({
      subjectName: Joi.string().required().trim(),
      score: Joi.number().min(0).max(100).required(),
    })
  ),
  events: Joi.string().trim(),
  date: Joi.string().trim(),
  overallScore: Joi.number().min(0).max(100),
  overallAttendance: Joi.number().min(0).max(100),
  specialisation: Joi.string().trim().valid('Marketing', 'Finance', 'HR/Operations', 'Analytics'),
  badge: Joi.string().trim().valid('gold', 'silver', 'bronze'),
  photo: Joi.string().trim().pattern(/^data:image\/(jpeg|png|gif|bmp|webp);base64,/, 'valid base64 image'),
  aadharNumber: Joi.string().allow('', null).trim().pattern(/^[0-9]{12}$/, 'must be exactly 12 digits'),
}).min(1); // At least one field to update