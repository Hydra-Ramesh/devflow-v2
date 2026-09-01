import { Request, Response, NextFunction } from 'express';
import { QuestionService } from '../services/question.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class QuestionController {
  static async createQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const question = await QuestionService.createQuestion(userId, req.body);
      res.status(201).json({
        success: true,
        data: question,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getQuestionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const question = await QuestionService.getQuestionById(id);
      if (!question) {
        res.status(404).json({ success: false, message: 'Question not found' });
        return;
      }
      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const question = await QuestionService.updateQuestion(id, userId, req.body);
      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (err: any) {
      if (err.message === 'Question not found') {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message === 'Unauthorized') {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async deleteQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await QuestionService.deleteQuestion(id, userId);
      res.status(200).json({
        success: true,
        message: 'Question deleted successfully',
      });
    } catch (err: any) {
      if (err.message === 'Question not found') {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message === 'Unauthorized') {
        res.status(403).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  static async getQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await QuestionService.getQuestions(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async searchQuestions(req: Request, res: Response, next: NextFunction) {
    // We can reuse getQuestions since it handles search querying too
    try {
      const result = await QuestionService.getQuestions(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const query = { ...req.query, authorId: userId };
      const result = await QuestionService.getQuestions(query);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}
