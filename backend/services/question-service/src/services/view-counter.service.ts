import { redis } from '../config/redis.js';
import { prisma } from '../config/prisma.js';

const BUFFER_KEY = 'devflow:buffered_question_views';
const FLUSH_INTERVAL_MS = 5000;

export class ViewCounterService {
  private static timer: NodeJS.Timeout | null = null;

  static startBatchFlusher(): void {
    if (this.timer) return;

    this.timer = setInterval(async () => {
      await this.flushViewsToDatabase();
    }, FLUSH_INTERVAL_MS);

    console.log('⚡ View counter asynchronous batch flusher started');
  }

  static async recordView(questionId: string): Promise<void> {
    try {
      await redis.hincrby(BUFFER_KEY, questionId, 1);
    } catch {
      prisma.question
        .update({
          where: { id: questionId },
          data: { viewCount: { increment: 1 } },
        })
        .catch(() => {});
    }
  }

  static async flushViewsToDatabase(): Promise<void> {
    try {
      const allViews = await redis.hgetall(BUFFER_KEY);
      if (!allViews || Object.keys(allViews).length === 0) return;

      await redis.del(BUFFER_KEY);

      const updates = Object.entries(allViews).map(async ([questionId, countStr]) => {
        const count = parseInt(countStr as string, 10);
        if (count > 0) {
          await prisma.question.update({
            where: { id: questionId },
            data: { viewCount: { increment: count } },
          });
        }
      });

      await Promise.allSettled(updates);
    } catch (err) {
      console.warn('View counter batch flush error:', err);
    }
  }

  static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
