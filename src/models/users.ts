import { model, Schema } from "mongoose";
import { Collections, Role, Status } from "../enum";
import { IUser } from "./type.model";

const userSchema = new Schema<IUser>(
  {
    address: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Status,
      default: Status.inactive,
    },
    role: {
      type: String,
      enum: Role,
      default: Role.shop,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = model(Collections.users, userSchema);
export default UserModel;
