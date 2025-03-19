import { Types } from "mongoose";
import { GraphQLError } from "graphql";
import { Role, Status } from "../../enum";
import { GetCartsInput, InsertToCartInput } from "../../graphql-types";
import { IContextGraphQlValue, IInput, IModules } from "../../types";
import { checkRole, operationsGraphql } from "../../utils";
import CartModel from "../../models/cart";
import ProductModel from "../../models/product";
import { ICart, ICartItem } from "../../models/type.model";

const cartModule = (): IModules => {
  return {
    typeDefs: `#graphql
        type CartItem {
            _id: ID
            product: Product
            variant: ID
            quantity: Int
            price: Float
            createdAt: Float
            updatedAt: Float
        }
        type Cart {
            _id: ID
            user: User
            items: [CartItem]
            totalAmount: Float
            status: Status
            shop: Shop
            createdAt: Float
            updatedAt: Float
        }
        input GetCartsInput {
            userId: String
        }
        input InsertToCartInput {
          shop: String!
          product: String!
          variant: String
          quantity: Int!
          userId: String
        }
        type Query {
            ${operationsGraphql.getCarts.name}(input: GetCartsInput): [Cart]
        }
        type Mutation {
          ${operationsGraphql.insertToCart.name}(input: InsertToCartInput): Cart
        }
    `,
    resolvers: {
      Mutation: {
        [operationsGraphql.insertToCart.name]: async (
          _,
          { input }: IInput<InsertToCartInput>,
          context: IContextGraphQlValue
        ) => {
          checkRole([Role.admin, Role.customer], context);
          const payload = { ...input };
          if (!payload.userId && !context.verifiedToken._id)
            throw new GraphQLError("Permission denied!");
          const findExistedCart = await CartModel.findOne({
            shop: payload.shop,
            user: payload.userId ?? context.verifiedToken._id,
          });
          const currentProduct = await ProductModel.findById(
            payload.product
          ).lean();
          if (
            currentProduct &&
            currentProduct.shop.toString() !== String(payload.shop)
          )
            throw new GraphQLError("Sản phẩm hiện không khả dụng!");
          if (
            (currentProduct && currentProduct.status !== Status.active) ||
            !currentProduct
          )
            throw new GraphQLError("Sản phẩm hiện không khả dụng!");
          const currentVariant = currentProduct.variants.find((variant) => {
            return variant._id.toString() === payload.variant.toString();
          });
          if (currentVariant && currentVariant.status !== Status.active)
            throw new GraphQLError("Sản phẩm hiện không khả dụng!");
          if (!findExistedCart) {
            if (Number(payload.quantity) > Number(currentVariant.stock)) {
              throw new GraphQLError("Mặt hàng không đủ số lượng!");
            }
            const newCart: ICart = {
              shop: payload.shop,
              status: Status.active,
              user:
                payload.userId ??
                (context.verifiedToken._id as unknown as Types.ObjectId),
              items: [
                {
                  price: currentVariant.price,
                  product: currentProduct._id,
                  quantity: payload.quantity as number,
                  variant: payload.variant ?? null,
                },
              ],
              totalAmount: 0,
            };
            const createdNewCart = await CartModel.create(newCart);
            return createdNewCart;
          } else {
            const checkExistVariant = findExistedCart.items.find((item) => {
              return item.variant.toString() === payload.variant.toString();
            });
            if (checkExistVariant) {
              if (
                Number(checkExistVariant.quantity) + Number(payload.quantity) >
                Number(currentVariant.stock)
              ) {
                throw new GraphQLError("Mặt hàng không đủ số lượng!");
              } else {
                checkExistVariant.quantity += Number(payload.quantity);
              }
            } else {
              if (Number(payload.quantity) > Number(currentVariant.stock)) {
                throw new GraphQLError("Mặt hàng không đủ số lượng!");
              }
              const newVariant: ICartItem = {
                price: currentVariant.price,
                product: currentProduct._id,
                quantity: Number(payload.quantity),
                variant:
                  (currentVariant._id as unknown as Types.ObjectId) ?? null,
                _id: new Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              findExistedCart.items.push(newVariant);
            }
            await findExistedCart.save();
            return findExistedCart;
          }
        },
      },
      Query: {
        [operationsGraphql.getCarts.name]: async (
          _,
          { input }: IInput<GetCartsInput>,
          context: IContextGraphQlValue
        ) => {
          checkRole([Role.admin, Role.customer], context);
          const payload = { ...input };
          if (
            payload.userId !== payload.userId &&
            context.verifiedToken.role === Role.customer
          )
            throw new GraphQLError("Permission denied!");
          const findCartsOfCustomer = await CartModel.find({
            user: payload.userId ?? context.verifiedToken._id,
          })
            .populate("user shop items")
            .populate({
              path: "items",
              populate: {
                path: "product",
              },
            })
            .sort({
              updatedAt: -1,
            });
          return findCartsOfCustomer;
        },
      },
    },
  };
};

export default cartModule;
