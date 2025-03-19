import mongoose, { Schema } from "mongoose";
import { Collections, Status } from "../enum";
import { IProduct, IVariant } from "./type.model";

export const variantSchema = new Schema<IVariant>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    attributes: [
      {
        key: String,
        value: String,
      },
    ],
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    imageIndex: Number,
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.active,
    },
  },
  { timestamps: true }
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: Collections.categories,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.active,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    variants: [variantSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: Collections.users,
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: Collections.users,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: Collections.shops,
      required: true,
    },
    keywords: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model(Collections.products, productSchema);

export default ProductModel;
