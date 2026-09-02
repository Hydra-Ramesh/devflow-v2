import { consumer } from '../config/kafka.js';
import prisma from '../config/prisma.js';
import redis from '../config/redis.js';

export async function startAnswerConsumer(): Promise<void> {
  try {
    await consumer.connect();
    console.log('Kafka Consumer connected (Answer Service)');

    await consumer.subscribe({
      topics: ['vote-cast'],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        try {
          const raw = JSON.parse(message.value.toString());
          const payload = raw.payload || raw;
          console.log(`[Answer Service] Processed Kafka message [${topic}]`);

          if (topic === 'vote-cast') {
            const { targetId, value, targetType, entityId, entityType } = payload;
            
            const type = (targetType || entityType || '').toUpperCase();
            const id = targetId || entityId;

            if (id && type === 'ANSWER') {
              if (value > 0) {
                await prisma.answer.update({
                  where: { id },
                  data: { upvotesCount: { increment: 1 } },
                });
              } else if (value < 0) {
                await prisma.answer.update({
                  where: { id },
                  data: { downvotesCount: { increment: 1 } },
                });
              }

              const answer = await prisma.answer.findUnique({ where: { id }, select: { questionId: true } });
              if (answer) {
                 await redis.del(`answers:question:${answer.questionId}`);
              }
            }
          }
        } catch (err) {
          console.error(`[Answer Service] Error processing Kafka event [${topic}]:`, err);
        }
      },
    });
  } catch (err) {
    console.warn('[Answer Service] Kafka Consumer startup failed:', err);
  }
}
