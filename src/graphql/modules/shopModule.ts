import { GraphQLError } from "graphql";
import { GetShopByOwnerIdInput, SaveShopInfoInput } from "../../graphql-types";
import ShopModel from "../../models/shop";
import { IContextGraphQlValue, IInput, IModules } from "../../types";
import { checkRole, operationsGraphql } from "../../utils";
import { Role } from "../../enum";

const shopModule: () => IModules = () => {
  return {
    typeDefs: `#graphql
        type Shop {
            _id: ID
            address: Address
            description: String
            email: String!
            facebook: String
            instagram: String
            logo: String
            name: String!
            phone: String
            tiktok: String
            youtube: String
            servicePackage: ServicePackage
            owner: User
        }
        input SaveShopInfoInput {
            address: AddressInput
            description: String
            email: String!
            facebook: String
            instagram: String
            logo: String
            name: String!
            phone: String!
            tiktok: String
            youtube: String
            servicePackage: ServicePackage
            owner: String

        }
        input GetShopByOwnerIdInput {
            ownerId : String!
        }
        type Query {
            ${operationsGraphql.getShopByOwnerId.name} (input: GetShopByOwnerIdInput): Shop
        }
        type Mutation {
            ${operationsGraphql.updateShopInfo.name} (input: SaveShopInfoInput): Shop
            ${operationsGraphql.createShopInfo.name} (input: SaveShopInfoInput): Shop
        }
    `,
    resolvers: {
      Mutation: {
        [operationsGraphql.updateShopInfo.name]: async (
          _,
          { input }: IInput<SaveShopInfoInput>,
          context: IContextGraphQlValue
        ) => {
          const payload = { ...input };
          checkRole([Role.admin, Role.shop], context);
          if (context.verifiedToken._id !== payload.owner)
            throw new GraphQLError("Permission denied!");
          const updatedShopInfo = await ShopModel.findByIdAndUpdate(
            payload.owner as string,
            payload,
            { new: true }
          );
          return updatedShopInfo;
        },
        [operationsGraphql.createShopInfo.name]: async (
          _,
          { input }: IInput<SaveShopInfoInput>,
          context: IContextGraphQlValue
        ) => {
          const payload = { ...input };
          checkRole([Role.admin, Role.shop], context);
          if (Role.shop) delete payload.servicePackage;
          const createShopInfo = await ShopModel.create(payload);
          return createShopInfo;
        },
      },
      Query: {
        [operationsGraphql.getShopByOwnerId.name]: async (
          _,
          { input }: IInput<GetShopByOwnerIdInput>
        ) => {
          const payload = { ...input };
          const currentShopInfo = await ShopModel.findOne({
            owner: payload.ownerId,
          }).populate("owner");
          if (!currentShopInfo)
            throw new GraphQLError(
              "Chưa có thông tin cửa hàng của chủ sở hữu này!"
            );
          return currentShopInfo.toObject();
        },
      },
    },
  };
};

export default shopModule;
