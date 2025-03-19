import mongoose, { Schema } from "mongoose";
import { Collections, Status } from "../enum";
import { ICart, ICartItem } from "./type.model";

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: Collections.products,
    },
    variant: {
      type: Schema.Types.ObjectId,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: Collections.users,
      required: true,
      index: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.active,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: Collections.shops,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  next();
});

const CartModel = mongoose.model(Collections.carts, cartSchema);

export default CartModel;
