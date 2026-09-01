import { publishEvent } from "../config/kafka.js";
import { QuestionDTO } from "../types/index.js";

export class QuestionProducer {
  static async publishCreated(question: QuestionDTO): Promise<void> {
    await publishEvent("question-created", question.id, {
      questionId: question.id,
      slug: question.slug,
      authorId: question.authorId,
      title: question.title,
      content: question.content,
      tags: question.tags,
      createdAt: question.createdAt,
    });
  }

  static async publishUpdated(question: QuestionDTO): Promise<void> {
    await publishEvent("question-updated", question.id, {
      questionId: question.id,
      slug: question.slug,
      authorId: question.authorId,
      title: question.title,
      content: question.content,
      tags: question.tags,
      updatedAt: question.updatedAt,
    });
  }

  static async publishDeleted(
    questionId: string,
    authorId: string,
  ): Promise<void> {
    await publishEvent("question-deleted", questionId, {
      questionId,
      authorId,
    });
  }
}
