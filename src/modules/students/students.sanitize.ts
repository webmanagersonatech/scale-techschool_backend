import Joi from 'joi';

export const createStudentSchema = Joi.object({
  studentScaleId: Joi.string().required().trim(),
  name: Joi.string().required().trim(),
  phone: Joi.string().required().trim(),
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
});

export const updateStudentSchema = Joi.object({
  studentScaleId: Joi.string().trim(),
  name: Joi.string().trim(),
  phone: Joi.string().trim(),
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
   date: Joi.string().required().trim(),
  overallScore: Joi.number().min(0).max(100),
  overallAttendance: Joi.number().min(0).max(100),
}).min(1); // At least one field to update