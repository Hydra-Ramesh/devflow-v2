import crypto from 'crypto';
import { Kafka, logLevel } from 'kafkajs';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { AuditLog } from '../model/audit_log.model.js';
import { auditEventsIngestedCounter } from '../metrics/metrics.js';

const brokersList = (env.KAFKA_BROKERS || env.KAFKA_BROKER || 'localhost:9092')
  .split(',')
  .map((b) => b.trim())
  .filter(Boolean);

const kafka = new Kafka({
  clientId: 'audit-service',
  brokers: brokersList,
  logLevel: logLevel.ERROR,
  retry: {
    initialRetryTime: 100,
    retries: 5,
  },
});

export const consumer = kafka.consumer({ groupId: 'audit-service-group' });

export const AUDIT_TOPICS = [
  'audit-events',
  'user-registered',
  'user-login',
  'email-new-login',
  'user-badge-unlocked',
  'password-reset-requested',
  'question-created',
  'question-updated',
  'question-deleted',
  'answer-created',
  'answer-accepted',
  'vote-cast',
  'vote-toggled',
  'role-changed',
];

export async function connectKafka() {
  try {
    await consumer.connect();
    logger.info('Kafka Consumer connected successfully');

    for (const topic of AUDIT_TOPICS) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }
    logger.info(`Subscribed to ${AUDIT_TOPICS.length} critical audit topics`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;

        const rawStr = message.value.toString();
        let parsed = {};

        try {
          parsed = JSON.parse(rawStr);
        } catch {
          parsed = { raw: rawStr };
        }

        const payload = parsed.payload || parsed;
        const eventId = parsed.eventId || payload.auditId || crypto.randomUUID();
        const action = payload.action || parsed.eventType || topic.toUpperCase();
        const userId =
          payload.userId ||
          parsed.userId ||
          payload.authorId ||
          payload.id ||
          message.key?.toString() ||
          null;
        const correlationId =
          payload.correlationId ||
          parsed.correlationId ||
          message.headers?.correlationId?.toString() ||
          'N/A';
        const ip = payload.ip || 'N/A';
        const userAgent = payload.userAgent || 'N/A';
        const timestamp = parsed.timestamp ? new Date(parsed.timestamp) : new Date();
        const service = payload.service || parsed.service || 'unknown';

        try {
          const logEntry = new AuditLog({
            eventId,
            topic,
            action,
            service,
            userId,
            correlationId,
            ip,
            userAgent,
            payload,
            timestamp,
          });

          await logEntry.save();
          auditEventsIngestedCounter.inc({ topic, action });
          logger.debug(`Ingested audit event [${topic}]: ${action}`);
        } catch (err) {
          logger.error(`Failed to save audit log for [${topic}]:`, { error: err.message });
        }
      },
    });
  } catch (err) {
    logger.error('Kafka Consumer startup error (will retry):', { error: err.message });
  }
}

export async function disconnectKafka() {
  try {
    await consumer.disconnect();
    logger.info('Kafka consumer disconnected cleanly');
  } catch (err) {
    logger.error('Error disconnecting Kafka consumer:', { error: err.message });
  }
}
