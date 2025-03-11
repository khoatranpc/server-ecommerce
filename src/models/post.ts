import mongoose from "mongoose";
import { Collections, Status } from "../enum";

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, required: true, index: true },
    description: {
      type: String,
      required: true,
    },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Collections.users,
      required: true,
      index: true,
    },
    tags: [{ type: String, trim: true }],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Collections.categories,
      },
    ],
    images: [{ type: String }],
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Collections.products,
      index: true,
    },
    banner: String,
    status: {
      type: String,
      enum: Status,
      default: Status.active,
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PostModel = mongoose.model(Collections.posts, PostSchema);

export default PostModel;
