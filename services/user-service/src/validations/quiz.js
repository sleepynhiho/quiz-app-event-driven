import Joi from 'joi';

export const joinQuizSchema = Joi.object({
  quizId: Joi.string()
    .required()
    .messages({
      'any.required': 'Quiz ID is required',
    }),
}); 