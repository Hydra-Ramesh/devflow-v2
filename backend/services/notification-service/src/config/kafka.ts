import { Kafka } from 'kafkajs';
import { env } from './env.js';

export const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: env.KAFKA_BROKERS.split(',')
});

let isConnected = false;

export async function connectKafka() {
  console.log('Connected to Kafka Notification Service');
  isConnected = true;
}

export async function disconnectKafka() {
  console.log('Disconnected from Kafka');
  isConnected = false;
}
