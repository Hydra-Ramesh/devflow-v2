import { Kafka } from "kafkajs";
import { notificationRepository } from "../repositories/notification.repository.js";
import { getIO } from "../config/socket.js";
import { redis } from "../config/redis.js";

export async function startNotificationConsumer(
  kafkaInstance: Kafka,
): Promise<void> {
  const consumer = kafkaInstance.consumer({
    groupId: "notification-service-group",
  });

  try {
    await consumer.connect();
    console.log(" Kafka Consumer connected Notification Service");
    await consumer.subscribe({
      topics: [
        "user-updated",
        "user-created",
        "vote-cast",
        "answer-accepted",
        "answer-created",
        "comment-created",
        "question-created",
      ],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        try {
          const raw = JSON.parse(message.value.toString());
          const payload = raw.payload || raw;
          console.log(`📥 Processed Kafka message [${topic}]`);

          if (topic === "user-updated" || topic === "user-created") {
            const { id, fullName, avatarUrl, reputation } = payload;
            if (id) {
              const userProfile = {
                full_name: fullName,
                avatar_url: avatarUrl,
                reputation: reputation || 0,
              };
              await redis.set(
                `user:profile:${id}`,
                JSON.stringify(userProfile),
              );
              console.log(`👤 Replicated user profile in Redis for ${id}`);
            }
            return;
          }

          let notificationData = null;

          if (topic === "answer-accepted") {
            notificationData = {
              recipientId: payload.authorId,
              actorId: payload.acceptedBy,
              type: "ACCEPT",
              entityId: payload.questionId,
            };
          } else if (topic === "vote-cast") {
            const { entityId, userVote, voterId, targetType, authorId } =
              payload;
            if (voterId && authorId && voterId !== authorId && userVote !== 0) {
              notificationData = {
                recipientId: authorId,
                actorId: voterId,
                type: userVote === 1 ? "UPVOTE" : "DOWNVOTE",
                entityId: entityId,
              };
            }
          } else if (topic === "question-created") {
            const { id, authorId } = payload;
            if (id && authorId) {
              await redis.set(`entity:author:question:${id}`, authorId);
            }
          } else if (topic === "answer-created") {
            const { answerId, authorId, questionId } = payload;
            if (answerId && authorId) {
              await redis.set(`entity:author:answer:${answerId}`, authorId);
            }
            
            // Generate notification for question author
            if (questionId && authorId) {
              const qAuthorId = await redis.get(`entity:author:question:${questionId}`);
              if (qAuthorId && qAuthorId !== authorId) {
                notificationData = {
                  recipientId: qAuthorId,
                  actorId: authorId,
                  type: "ANSWER",
                  entityId: questionId,
                };
              }
            }
          } else if (topic === "comment-created") {
            // comment-service emits: commentId, authorId, entityType, entityId
            const { entityId, entityType, authorId } = payload;
            if (entityId && entityType && authorId) {
              const targetAuthorId = await redis.get(`entity:author:${entityType}:${entityId}`);
              if (targetAuthorId && targetAuthorId !== authorId) {
                notificationData = {
                  recipientId: targetAuthorId,
                  actorId: authorId,
                  type: "COMMENT",
                  entityId: entityId,
                };
              }
            }
          }

          if (
            notificationData &&
            notificationData.recipientId !== notificationData.actorId
          ) {
            const notification =
              await notificationRepository.createNotification(notificationData);

            const redisData = await redis.get(
              `user:profile:${notification.actorId}`,
            );
            let actorProfile = null;
            if (redisData) {
              actorProfile = JSON.parse(redisData);
            }

            const formattedNotification = {
              _id: notification.id,
              id: notification.id,
              recipient_id: notification.recipientId,
              actor_id: notification.actorId,
              type: notification.type,
              entity_id: notification.entityId,
              is_read: notification.isRead,
              created_at: notification.createdAt,
              actor: actorProfile,
            };

            const io = getIO();
            io.to(`user_${notification.recipientId}`).emit(
              "new_notification",
              formattedNotification,
            );
            console.log(
              ` Sent ${notification.type} notification to user ${notification.recipientId}`,
            );
          }
        } catch (err) {
          console.error(`Error processing Kafka event [${topic}]:`, err);
        }
      },
    });
  } catch (error) {
    console.error(" Failed to start Notification Consumer", error);
  }
}
