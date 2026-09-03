import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { connectKafka, disconnectKafka, kafka } from "./config/kafka.js";
import { startCommentConsumer } from "./kafka/comment.consumer.js";

let server: any;

async function bootstrap() {
  console.log("Starting comment-service...");

  // Connect to DB and Kafka
  await connectDB();
  await connectKafka();

  // Start Kafka consumer
  await startCommentConsumer(kafka);

  const app = createApp();
  const port = env.PORT;
  server = app.listen(port, () => {
    console.log(`comment-service running on port ${port}`);
  });
}

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await disconnectKafka();
      await disconnectDB();
      console.log(" All connections cleanly closed. Exiting process.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION!", err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION!", err);
  process.exit(1);
});

bootstrap();
