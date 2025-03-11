import mongoose from "mongoose";
import { Collections } from "../enum";

const CommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Collections.posts,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Collections.users,
      required: true,
    },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: Collections.users }],
    replies: [
      { type: mongoose.Schema.Types.ObjectId, ref: Collections.comments },
    ],
  },
  { timestamps: true }
);

const CommentModel = mongoose.model(Collections.comments, CommentSchema);
export default CommentModel;
