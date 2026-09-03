import { kafka, publishEvent } from "../config/kafka.js";
import { CommentModel } from "../models/comment.model.js";
import { redis } from "../config/redis.js";

export async function startCommentConsumer(
  kafkaInstance: typeof kafka,
): Promise<void> {
  const commentConsumer = kafkaInstance.consumer({
    groupId: "comment-service-v2-group",
  });

  try {
    await commentConsumer.connect();
    console.log(" Kafka Consumer connected Comment Service");
    await commentConsumer.subscribe({
      topics: [
        "vote-cast",
        "data-export-requested",
        "user-updated",
        "user-created",
      ],
      fromBeginning: false,
    });

    await commentConsumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        try {
          const raw = JSON.parse(message.value.toString());
          const payload = raw.payload || raw;
          console.log(`Processed Kafka message [${topic}]`);

          if (topic === "vote-cast") {
            const { entityId, entityType, userVote, voterId, amountChanged } =
              payload;

            if (entityId && entityType === "COMMENT") {
              const comment = await CommentModel.findById(entityId);
              if (!comment) return;

              let upvotes = comment.upvotes || [];
              let downvotes = comment.downvotes || [];

              upvotes = upvotes.filter((id) => id !== voterId);
              downvotes = downvotes.filter((id) => id !== voterId);

              if (userVote === 1) {
                upvotes.push(voterId);
              } else if (userVote === -1) {
                downvotes.push(voterId);
              }

              comment.upvotes = upvotes;
              comment.downvotes = downvotes;
              await comment.save();

              await publishEvent("vote-events", entityId, {
                targetType: "comment",
                targetId: entityId,
                entity_type: "comment",
                entity_id: entityId,
                vote_type: userVote,
                authorId: comment.authorId,
                voterId,
              });
            }
          } else if (topic === "data-export-requested") {
            const { userId, exportId } = payload;
            if (userId && exportId) {
              const data = await CommentModel.find({ authorId: userId }).lean();

              await publishEvent("data-export-chunk-ready", exportId, {
                exportId: exportId,
                userId: userId,
                serviceName: "comment",
                data: data.map((d) => ({ ...d, id: d._id.toString() })),
              });
            }
          } else if (topic === "user-updated" || topic === "user-created") {
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
          }
        } catch (err) {
          console.error(`Error processing Kafka event [${topic}]:`, err);
        }
      },
    });
  } catch (err) {
    console.warn("Kafka Consumer startup failed:", err);
  }
}
