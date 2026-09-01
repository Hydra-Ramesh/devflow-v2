import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createQuestionSchema,
  updateQuestionSchema,
  queryQuestionSchema,
} from '../validators/question.validator.js';

const router = Router();

router.get('/search', validate(queryQuestionSchema, 'query'), QuestionController.searchQuestions);
router.get('/user/:userId', QuestionController.getUserQuestions);
router.get('/:id', QuestionController.getQuestionById);
router.get('/', validate(queryQuestionSchema, 'query'), QuestionController.getQuestions);

router.post(
  '/',
  requireAuth,
  validate(createQuestionSchema, 'body'),
  QuestionController.createQuestion
);

router.put(
  '/:id',
  requireAuth,
  validate(updateQuestionSchema, 'body'),
  QuestionController.updateQuestion
);

router.delete('/:id', requireAuth, QuestionController.deleteQuestion);

export default router;
