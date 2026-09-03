import { CommentModel, IComment } from "../models/comment.model.js";
import { publishEvent } from "../config/kafka.js";
import { redis, deleteCache } from "../config/redis.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../utils/error.js";

export class CommentService {
  async createComment(data: {
    authorId: string;
    entityType: string;
    entityId: string;
    content: string;
    parentId?: string;
  }): Promise<IComment> {
    if (!["question", "answer"].includes(data.entityType.toLowerCase())) {
      throw new BadRequestError("Entity type must be question or answer");
    }

    const payload = {
      content: data.content,
      authorId: data.authorId,
      questionId:
        data.entityType.toLowerCase() === "question"
          ? data.entityId
          : undefined,
      answerId:
        data.entityType.toLowerCase() === "answer" ? data.entityId : undefined,
      parentId: data.parentId || null,
    };

    const comment = await CommentModel.create(payload);

    await publishEvent("comment-created", comment._id.toString(), {
      commentId: comment._id.toString(),
      authorId: data.authorId,
      entityType: data.entityType.toLowerCase(),
      entityId: data.entityId,
      content: data.content,
      parentId: data.parentId,
    });

    await deleteCache(
      `comments:${data.entityType.toLowerCase()}:${data.entityId}`,
    );

    return comment;
  }

  async updateComment(
    commentId: string,
    authorId: string,
    content: string,
  ): Promise<IComment> {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }
    if (comment.authorId !== authorId) {
      throw new ForbiddenError("Unauthorized to edit this comment");
    }

    comment.content = content;
    await comment.save();

    await publishEvent("comment-updated", comment._id.toString(), {
      id: comment._id.toString(),
      content: comment.content,
    });

    const entityType = comment.questionId ? "question" : "answer";
    const entityId = comment.questionId || comment.answerId;
    await deleteCache(`comments:${entityType}:${entityId}`);

    return comment;
  }

  async deleteComment(commentId: string, authorId: string): Promise<void> {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }
    if (comment.authorId !== authorId) {
      throw new ForbiddenError("Unauthorized to delete this comment");
    }

    await CommentModel.deleteOne({ _id: commentId });

    await publishEvent("comment-deleted", commentId, {
      id: commentId,
      authorId: authorId,
    });

    const entityType = comment.questionId ? "question" : "answer";
    const entityId = comment.questionId || comment.answerId;
    await deleteCache(`comments:${entityType}:${entityId}`);
  }

  async getComments(entityType: string, entityId: string): Promise<IComment[]> {
    if (!["question", "answer"].includes(entityType.toLowerCase())) {
      throw new BadRequestError("Entity type must be question or answer");
    }

    const cacheKey = `comments:${entityType.toLowerCase()}:${entityId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const query =
      entityType.toLowerCase() === "question"
        ? { questionId: entityId }
        : { answerId: entityId };

    const comments = await CommentModel.find(query)
      .sort({ createdAt: 1 })
      .lean();

    const authorIds = [...new Set(comments.map((c) => c.authorId))];
    const redisKeys = authorIds.map((id) => `user:profile:${id}`);

    let cachedUsers: Record<string, any> = {};
    if (redisKeys.length > 0) {
      const redisData = await redis.mget(...redisKeys);
      authorIds.forEach((id, index) => {
        if (redisData[index]) {
          cachedUsers[id] = JSON.parse(redisData[index] as string);
        }
      });
    }

    const formatted = comments.map((c) => ({
      ...c,
      id: c._id.toString(),
      author: cachedUsers[c.authorId] || null,
    }));

    await redis.set(cacheKey, JSON.stringify(formatted), "EX", 300);

    return formatted as unknown as IComment[];
  }
}

export const commentService = new CommentService();
