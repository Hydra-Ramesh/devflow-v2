import prisma from "../config/prisma.js";

export class AnswerRepository {
  async createAnswer(data: {
    content: string;
    authorId: string;
    questionId: string;
  }) {
    return prisma.answer.create({ data });
  }

  async getAnswersByQuestionId(questionId: string) {
    return prisma.answer.findMany({
      where: { questionId },
      orderBy: [
        { isAccepted: "desc" },
        { upvotesCount: "desc" },
        { createdAt: "asc" },
      ],
    });
  }

  async getAnswerById(id: string) {
    return prisma.answer.findUnique({ where: { id } });
  }

  async updateAnswer(
    id: string,
    data: { content?: string; isAccepted?: boolean },
  ) {
    return prisma.answer.update({
      where: { id },
      data,
    });
  }

  async deleteAnswer(id: string) {
    return prisma.answer.delete({ where: { id } });
  }
}

export const answerRepository = new AnswerRepository();
