import { Kafka } from 'kafkajs';
import { KAFKA_BROKER as KAFKA_BROKERS } from '../config/env.js';
import { io } from '../service/server.js';

const kafka = new Kafka({
  clientId: 'realtime-service-v2',
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: 'realtime-service-group' });

export const startKafkaConsumer = async () => {
  try {
    await consumer.connect();
    
    await consumer.subscribe({ topic: 'vote-events', fromBeginning: false });
    await consumer.subscribe({ topic: 'comment-events', fromBeginning: false });
    await consumer.subscribe({ topic: 'answer-events', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;
        
        try {
          const payload = JSON.parse(message.value.toString());
          console.log(`[Kafka] Received event on topic ${topic}`);
          
          switch (topic) {
            case 'vote-events': {
              if (payload.targetType === 'question') {
                io.to(`question_${payload.targetId}`).emit('vote_update', payload);
              }
              break;
            }
            case 'comment-events': {
              if (payload.targetType === 'question') {
                io.to(`question_${payload.targetId}`).emit('new_comment', payload.comment);
              }
              break;
            }
            case 'answer-events': {
              io.to(`question_${payload.questionId}`).emit('new_answer', payload.answer);
              break;
            }
            default:
              console.warn(`[Kafka] Unhandled topic: ${topic}`);
          }
        } catch (err) {
          console.error(`[Kafka] Error processing message on topic ${topic}`, err);
        }
      },
    });
    console.log('[Kafka] Consumer connected and listening');
  } catch (error) {
    console.error('[Kafka] Failed to connect consumer', error);
  }
};

export const stopKafkaConsumer = async () => {
  await consumer.disconnect();
};
