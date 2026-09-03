import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  authorId: string;
  questionId?: string;
  answerId?: string;
  articleId?: string;
  content: string;
  parentId: string | null;
  upvotes: string[];
  downvotes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema(
  {
    authorId: { type: String, required: true, index: true },
    questionId: { type: String, index: true },
    answerId: { type: String, index: true },
    articleId: { type: String, index: true },
    content: { type: String, required: true },
    parentId: { type: String, default: null, index: true },
    upvotes: { type: [String], default: [] },
    downvotes: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

export const CommentModel = mongoose.model<IComment>("Comment", CommentSchema);
