import { model, Schema, Types } from "mongoose";
import { IShop } from "./type.model";
import { Collections, ServicePackage } from "../enum";

const shopSchema = new Schema<IShop>(
  {
    address: {
      province: Number,
      district: Number,
      ward: Number,
      detail: String,
    },
    description: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    facebook: String,
    instagram: String,
    logo: String,
    name: {
      type: String,
      required: true,
    },
    phone: String,
    tiktok: String,
    youtube: String,
    servicePackage: {
      type: String,
      enum: ServicePackage,
      default: ServicePackage.trial,
    },
    owner: {
      type: Types.ObjectId,
      ref: Collections.users,
    },
  },
  {
    timestamps: true,
  }
);

const ShopModel = model(Collections.shops, shopSchema);

export default ShopModel;
