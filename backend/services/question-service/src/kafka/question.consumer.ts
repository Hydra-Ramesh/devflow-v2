import { consumer } from '../config/kafka.js';
import { prisma } from '../config/prisma.js';
import { deleteCache } from '../config/redis.js';

export async function startQuestionConsumer(): Promise<void> {
  try {
    await consumer.connect();
    console.log('Kafka Consumer connected (Question Service)');

    await consumer.subscribe({
      topics: ['vote-cast', 'answer-created', 'answer-accepted', 'user-registered', 'user-updated'],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        try {
          const raw = JSON.parse(message.value.toString());
          const payload = raw.payload || raw;
          console.log(`📥 Processed Kafka message [${topic}]`);

          if (topic === 'vote-cast') {
            const { questionId, value, targetType } = payload;
            if (questionId && (targetType === 'QUESTION' || !targetType)) {
              if (value > 0) {
                await prisma.question.update({
                  where: { id: questionId },
                  data: { upvotesCount: { increment: 1 } },
                });
              } else if (value < 0) {
                await prisma.question.update({
                  where: { id: questionId },
                  data: { downvotesCount: { increment: 1 } },
                });
              }
              await deleteCache(`question:${questionId}`);
            }
          } else if (topic === 'answer-created') {
            const { questionId } = payload;
            if (questionId) {
              await prisma.question.update({
                where: { id: questionId },
                data: { answersCount: { increment: 1 } },
              });
              await deleteCache(`question:${questionId}`);
              await deleteCache('questions:feed:*');
            }
          } else if (topic === 'answer-accepted') {
            const { questionId, answerId } = payload;
            if (questionId) {
              await prisma.question.update({
                where: { id: questionId },
                data: { isSolved: true, acceptedAnswerId: answerId },
              });
              await deleteCache(`question:${questionId}`);
              await deleteCache('questions:feed:*');
            }
          } else if (topic === 'user-registered') {
            const { id, email, fullName, avatarUrl } = payload;
            await prisma.user.upsert({
              where: { id },
              update: { email, fullName, avatarUrl },
              create: { id, email, fullName, avatarUrl },
            });
          } else if (topic === 'user-updated') {
            const { id, email, fullName, avatarUrl, reputation } = payload;
            await prisma.user.upsert({
              where: { id },
              update: { email, fullName, avatarUrl, reputation },
              create: { id, email, fullName, avatarUrl, reputation },
            });
          }
        } catch (err) {
          console.error(`Error processing Kafka event [${topic}]:`, err);
        }
      },
    });
  } catch (err) {
    console.warn('⚠️ Kafka Consumer startup failed (will retry):', err);
  }
}
