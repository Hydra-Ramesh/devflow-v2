import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { connectKafka, disconnectKafka, kafka } from "./config/kafka.js";
import { startNotificationConsumer } from "./kafka/notification.consumer.js";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient } from "./config/redis.js";
import { setIO } from "./config/socket.js";

let server: any;

async function bootstrap() {
  console.log("Starting notification-service-v2...");

  // Connect external services
  await connectDB();
  await connectKafka();

  const app = createApp();
  const port = env.PORT;

  server = app.listen(port, async () => {
    console.log(`🚀 notification-service-v2 running on port ${port}`);

    // Initialize Socket.io Server
    const io = new Server(server, {
      cors: { origin: "*" },
    });

    // Use Redis Adapter for horizontal scaling
    io.adapter(createAdapter(pubClient, subClient));
    setIO(io);
    console.log("🔗 Notification WebSockets bound with Redis Adapter");

    // Handle Connections
    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId as string;
      if (userId) {
        // Join a private room for this user to receive direct notifications
        socket.join(`user_${userId}`);
        console.log(`📡 User ${userId} connected to notifications WebSocket`);
      }

      socket.on("disconnect", () => {
        if (userId) {
          console.log(
            `📡 User ${userId} disconnected from notifications WebSocket`,
          );
        }
      });
    });

    // Start Kafka consumer after IO is ready to prevent emitting to null
    await startNotificationConsumer(kafka);
  });
}

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await disconnectKafka();
      await disconnectDB();
      pubClient.disconnect();
      subClient.disconnect();
      console.log("✅ All connections cleanly closed. Exiting process.");
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
