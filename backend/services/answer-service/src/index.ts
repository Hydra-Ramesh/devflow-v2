import { createApp } from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/prisma.js";
import { connectKafka, disconnectKafka } from "./config/kafka.js";

async function bootstrap() {
  console.log(" Initializing DevFlow Answer Service (TypeScript)...");

  await connectKafka();

  const app = createApp();
  const PORT = parseInt(env.PORT, 10) || 5006;

  const server = app.listen(PORT, () => {
    console.log(` Answer Service is listening on port ${PORT}`);
    console.log(` Health check available at http://localhost:${PORT}/health`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      console.log("HTTP server closed.");
      await disconnectKafka();
      await prisma.$disconnect();
      console.log(" All connections cleanly closed. Exiting process.");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("Forcefully shutting down after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error(" Fatal error during bootstrap:", err);
  process.exit(1);
});
