import { answerRepository } from "../repositories/answer.repository.js";
import { publishEvent } from "../config/kafka.js";
import redis from "../config/redis.js";

export class AnswerService {
  async createAnswer(data: {
    content: string;
    authorId: string;
    questionId: string;
  }) {
    const answer = await answerRepository.createAnswer(data);

    await redis.del(`answers:question:${data.questionId}`);

    await publishEvent("answer-events", data.questionId, {
      targetType: "question",
      questionId: data.questionId,
      answer,
    });

    await publishEvent("answer-created", data.questionId, {
      questionId: data.questionId,
      answerId: answer.id,
      authorId: data.authorId,
    });

    await publishEvent("embedding-events", answer.id, {
      type: "index-answer",
      payload: answer,
    });

    await publishEvent("notification-events", data.questionId, {
      type: "ANSWER_CREATED",
      actorId: data.authorId,
      entityId: data.questionId,
      answerId: answer.id,
    });

    return answer;
  }

  async getAnswersForQuestion(questionId: string) {
    const cacheKey = `answers:question:${questionId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const answers = await answerRepository.getAnswersByQuestionId(questionId);

    if (answers.length > 0) {
      await redis.setex(cacheKey, 3600, JSON.stringify(answers));
    }
    return answers;
  }

  async acceptAnswer(id: string, userId: string, questionAuthorId: string) {
    const answer = await answerRepository.getAnswerById(id);
    if (!answer) {
      throw new Error("Answer not found");
    }

    if (questionAuthorId !== userId) {
      throw new Error("Only the question author can accept an answer");
    }

    const allAnswers = await answerRepository.getAnswersByQuestionId(
      answer.questionId,
    );
    for (const a of allAnswers) {
      if (a.isAccepted) {
        await answerRepository.updateAnswer(a.id, { isAccepted: false });
      }
    }

    const updatedAnswer = await answerRepository.updateAnswer(id, {
      isAccepted: true,
    });

    await redis.del(`answers:question:${answer.questionId}`);

    await publishEvent("answer-accepted", answer.questionId, {
      questionId: answer.questionId,
      answerId: answer.id,
      authorId: answer.authorId,
    });

    if (answer.authorId !== userId) {
      await publishEvent("user-reputation-events", answer.authorId, {
        userId: answer.authorId,
        increment: 15,
        reason: "ANSWER_ACCEPTED",
      });

      await publishEvent("notification-events", answer.authorId, {
        type: "ANSWER_ACCEPTED",
        recipientId: answer.authorId,
        actorId: userId,
        entityId: answer.questionId,
      });
    }

    return updatedAnswer;
  }

  async updateAnswer(
    id: string,
    authorId: string,
    data: { content?: string; isAccepted?: boolean },
  ) {
    const answer = await answerRepository.getAnswerById(id);
    if (!answer) throw new Error("Answer not found");

    if (data.content && answer.authorId !== authorId) {
      throw new Error("Unauthorized to edit this answer");
    }

    const updated = await answerRepository.updateAnswer(id, data);
    await redis.del(`answers:question:${answer.questionId}`);
    return updated;
  }

  async deleteAnswer(id: string, authorId: string) {
    const answer = await answerRepository.getAnswerById(id);
    if (!answer) throw new Error("Answer not found");

    if (answer.authorId !== authorId) {
      throw new Error("Unauthorized to delete this answer");
    }

    await answerRepository.deleteAnswer(id);
    await redis.del(`answers:question:${answer.questionId}`);
    return { message: "Answer deleted" };
  }
}

export const answerService = new AnswerService();
