import { Request, Response } from "express";
import { commentService } from "../services/comment.service.js";
import { UnauthorizedError, BadRequestError } from "../utils/error.js";

export class CommentController {
  async createComment(req: Request, res: Response) {
    const { entity_type, entity_id, content, parentId } = req.body;
    const authorId = (req as any).user?.id;

    if (!authorId) {
      throw new UnauthorizedError();
    }

    if (!["question", "answer"].includes(entity_type?.toLowerCase())) {
      throw new BadRequestError("Invalid entity_type");
    }

    const data = await commentService.createComment({
      authorId,
      entityType: entity_type,
      entityId: entity_id,
      content,
      parentId,
    });
    res.status(201).json({ status: "success", data });
  }

  async updateComment(req: Request, res: Response) {
    const { id } = req.params;
    const { content } = req.body;
    const authorId = (req as any).user?.id;

    if (!authorId) {
      throw new UnauthorizedError();
    }

    const data = await commentService.updateComment(id, authorId, content);
    res.status(200).json({ status: "success", data });
  }

  async deleteComment(req: Request, res: Response) {
    const { id } = req.params;
    const authorId = (req as any).user?.id;

    if (!authorId) {
      throw new UnauthorizedError();
    }

    await commentService.deleteComment(id, authorId);
    res
      .status(200)
      .json({ status: "success", message: "Comment deleted successfully" });
  }

  async getComments(req: Request, res: Response) {
    const { entityId, entityType } = req.query;

    if (
      !entityId ||
      typeof entityId !== "string" ||
      !entityType ||
      typeof entityType !== "string"
    ) {
      throw new BadRequestError(
        "entityId and entityType are required query parameters",
      );
    }

    const data = await commentService.getComments(entityType, entityId);
    res.status(200).json({ status: "success", data });
  }
}

export const commentController = new CommentController();
