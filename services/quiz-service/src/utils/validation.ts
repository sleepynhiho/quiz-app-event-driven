import Joi from 'joi';

export const createQuizSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Quiz title is required',
      'string.min': 'Quiz title must be at least 3 characters long',
      'string.max': 'Quiz title must not exceed 255 characters'
    }),
  
  questions: Joi.array()
    .items(
      Joi.object({
        content: Joi.string()
          .min(5)
          .max(1000)
          .required()
          .messages({
            'string.empty': 'Question content is required',
            'string.min': 'Question content must be at least 5 characters long',
            'string.max': 'Question content must not exceed 1000 characters'
          }),
        
        options: Joi.array()
          .items(Joi.string().min(1).max(255))
          .min(2)
          .max(6)
          .required()
          .messages({
            'array.min': 'Each question must have at least 2 options',
            'array.max': 'Each question can have at most 6 options',
            'array.base': 'Options must be an array of strings'
          }),
        
        correctAnswer: Joi.number()
          .integer()
          .min(0)
          .required()
          .messages({
            'number.base': 'Correct answer must be a number',
            'number.integer': 'Correct answer must be an integer',
            'number.min': 'Correct answer index must be 0 or greater'
          })
      }).custom((value, helpers) => {
        // Validate that correctAnswer index is within options array bounds
        if (value.correctAnswer >= value.options.length) {
          return helpers.error('custom.correctAnswerOutOfBounds');
        }
        return value;
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'Quiz must have at least 1 question',
      'array.max': 'Quiz can have at most 50 questions',
      'custom.correctAnswerOutOfBounds': 'Correct answer index must be within the options array bounds'
    })
});

export const validateCreateQuiz = (data: any) => {
  return createQuizSchema.validate(data, { abortEarly: false });
};
