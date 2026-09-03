import { Kafka, Producer, logLevel } from "kafkajs";
import { env } from "./env.js";

export const kafka = new Kafka({
  clientId: "comment-service-v2",
  brokers: env.KAFKA_BROKERS.split(","),
  logLevel: logLevel.ERROR,
  retry: {
    initialRetryTime: 100,
    retries: 5,
  },
});

export const producer: Producer = kafka.producer();
let isProducerConnected = false;

export async function connectKafka(): Promise<void> {
  try {
    await producer.connect();
    isProducerConnected = true;
    console.log("Kafka Producer connected Comment Service");
  } catch (err) {
    console.warn("Kafka Producer connection failed:", err);
  }
}

export async function disconnectKafka(): Promise<void> {
  if (isProducerConnected) {
    await producer.disconnect();
    console.log("Kafka disconnected");
  }
}

export async function publishEvent(
  topic: string,
  key: string,
  payload: Record<string, any>,
): Promise<void> {
  if (!isProducerConnected) {
    try {
      await producer.connect();
      isProducerConnected = true;
    } catch {
      console.warn(`Kafka producer not connected, skipping event [${topic}]`);
      return;
    }
  }

  const message = {
    eventId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    eventType: topic,
    payload,
  };

  try {
    await producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(message) }],
    });
    console.log(` Emitted Kafka event [${topic}] with key: ${key}`);
  } catch (err) {
    console.error(`Failed to publish Kafka event [${topic}]:`, err);
  }
}
