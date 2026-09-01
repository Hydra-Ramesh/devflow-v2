import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class QuestionRepository {
  private static userSelect = {
    id: true,
    fullName: true,
    avatarUrl: true,
    reputation: true,
  };

  static async create(data: Prisma.QuestionUncheckedCreateInput) {
    return prisma.question.create({
      data,
      include: {
        user: {
          select: this.userSelect,
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        user: {
          select: this.userSelect,
        },
      },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.question.findUnique({
      where: { slug },
      include: {
        user: {
          select: this.userSelect,
        },
      },
    });
  }

  static async update(id: string, data: Prisma.QuestionUpdateInput) {
    return prisma.question.update({
      where: { id },
      data,
      include: {
        user: {
          select: this.userSelect,
        },
      },
    });
  }

  static async delete(id: string) {
    return prisma.question.delete({
      where: { id },
    });
  }

  static async findMany(
    where: Prisma.QuestionWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.QuestionOrderByWithRelationInput
  ) {
    return prisma.question.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: {
          select: this.userSelect,
        },
      },
    });
  }

  static async count(where: Prisma.QuestionWhereInput): Promise<number> {
    return prisma.question.count({ where });
  }

  static async slugExists(slug: string): Promise<boolean> {
    const count = await prisma.question.count({ where: { slug } });
    return count > 0;
  }
}
