import slugify from 'slugify';
import { QuestionRepository } from '../repositories/question.repository.js';
import { publishEvent } from '../config/kafka.js';

export class QuestionService {
  static async createQuestion(userId: string, data: any) {
    let slug = slugify(data.title, { lower: true, strict: true, trim: true });
    // Ensure user exists in local database to satisfy foreign key constraint
    let exists = await QuestionRepository.slugExists(slug);
    let counter = 1;
    let uniqueSlug = slug;
    while (exists) {
      uniqueSlug = `${slug}-${counter}`;
      exists = await QuestionRepository.slugExists(uniqueSlug);
      counter++;
    }

    const question = await QuestionRepository.create({
      ...data,
      slug: uniqueSlug,
      authorId: userId,
    });

    publishEvent('question-created', question.id, question);
    return question;
  }

  static async getQuestionById(id: string) {
    return QuestionRepository.findById(id);
  }

  static async getQuestionBySlug(slug: string) {
    return QuestionRepository.findBySlug(slug);
  }

  static async updateQuestion(id: string, userId: string, data: any) {
    const existing = await QuestionRepository.findById(id);
    if (!existing) {
      throw new Error('Question not found');
    }
    if (existing.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    const question = await QuestionRepository.update(id, data);
    publishEvent('question-updated', question.id, question);
    return question;
  }

  static async deleteQuestion(id: string, userId: string) {
    const existing = await QuestionRepository.findById(id);
    if (!existing) {
      throw new Error('Question not found');
    }
    if (existing.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    await QuestionRepository.delete(id);
    publishEvent('question-deleted', id, { id });
    return { id };
  }

  static async getQuestions(query: any) {
    const { page, limit, filter, tags, q, authorId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }
    if (authorId) {
      where.authorId = authorId;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filter === 'votes') {
      orderBy = { upvotesCount: 'desc' };
    } else if (filter === 'unanswered') {
      where.answersCount = 0;
      orderBy = { createdAt: 'desc' };
    } else if (filter === 'frequent') {
      orderBy = { viewCount: 'desc' };
    }

    const [questions, total] = await Promise.all([
      QuestionRepository.findMany(where, skip, limit, orderBy),
      QuestionRepository.count(where),
    ]);

    return {
      data: questions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
