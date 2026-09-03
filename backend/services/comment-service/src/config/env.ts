import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || "5003",
  MONGO_URI:
    process.env.MONGO_URI || "mongodb://localhost:27017/devflow_comments",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  KAFKA_BROKERS: process.env.KAFKA_BROKERS || "localhost:9092",
  JWT_SECRET: process.env.JWT_SECRET || "your_default_jwt_secret_key",
};
