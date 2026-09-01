import { Request, Response, NextFunction } from "express";
import { answerService } from "../services/answer.service.js";

export class AnswerController {
  async createAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const questionId = req.body.questionId;
      const authorId = (req as any).user?.id || "anonymous";

      const answer = await answerService.createAnswer({
        ...req.body,
        authorId,
        questionId,
      });

      res.status(201).json({ status: "success", data: answer });
    } catch (error: any) {
      next(error);
    }
  }

  async getAnswersByQuestionId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const questionId = req.params.questionId;
      const answers = await answerService.getAnswersForQuestion(questionId);
      res.json({ status: "success", data: answers });
    } catch (error: any) {
      next(error);
    }
  }

  async updateAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authorId = (req as any).user?.id || "anonymous";

      const answer = await answerService.updateAnswer(id, authorId, req.body);

      res.json({ status: "success", data: answer });
    } catch (error: any) {
      next(error);
    }
  }

  async acceptAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || "anonymous";

      const questionAuthorId = req.body.questionAuthorId;
      if (!questionAuthorId) {
        throw new Error("questionAuthorId is required to verify ownership");
      }

      const answer = await answerService.acceptAnswer(
        id,
        userId,
        questionAuthorId,
      );
      res.json({ status: "success", data: answer, message: "Answer accepted" });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authorId = (req as any).user?.id || "anonymous";

      await answerService.deleteAnswer(id, authorId);
      res.json({ status: "success", message: "Answer deleted" });
    } catch (error: any) {
      next(error);
    }
  }
}

export const answerController = new AnswerController();
