import mongoose from "mongoose";
import { Collections, Status } from "../enum";
import { ICategory } from "./type.model";

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    slug: { type: String },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Collections.categories,
      default: null,
    },
    status: { type: String, enum: Status, default: Status.active },
    imageUrl: { type: String, trim: true },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Collections.shops,
      required: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: Collections.users },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: Collections.users },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const CategoryModel = mongoose.model(Collections.categories, categorySchema);

export default CategoryModel;
