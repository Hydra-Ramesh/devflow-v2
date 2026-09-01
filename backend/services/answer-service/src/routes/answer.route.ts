import { Router } from 'express';
import { answerController } from '../controllers/answer.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { createAnswerSchema, updateAnswerSchema } from '../validators/answer.validator.js';

export const answerRoutes = Router();

answerRoutes.post('/', requireAuth, validate(createAnswerSchema), answerController.createAnswer);
answerRoutes.get('/question/:questionId', optionalAuth, answerController.getAnswersByQuestionId);
answerRoutes.patch('/:id/accept', requireAuth, answerController.acceptAnswer);
answerRoutes.patch('/:id', requireAuth, validate(updateAnswerSchema), answerController.updateAnswer);
answerRoutes.delete('/:id', requireAuth, answerController.deleteAnswer);
