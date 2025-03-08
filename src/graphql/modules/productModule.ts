import { GraphQLError } from "graphql";
import { Role } from "../../enum";
import { CreateProductInput } from "../../graphql-types";
import { operationsGraphql } from "../../utils";
import { IContextGraphQlValue, IInput, IModules } from "./../../types";
import ProductModel from "../../models/product";
import slugify from "slugify";
const productModule = (): IModules => {
  return {
    typeDefs: `#graphql
     type Attribute {
        key: String!
        value: String!
    }

    type Variant {
        _id: ID!
        name: String!
        price: Float!
        stock: Int
        attributes: [Attribute!]!
        sku: String!
        images: String
        status: Status
    }
    type Product {
        _id: ID!
        name: String!
        description: String
        price: Float!
        images: [String]
        category: ID!
        status: Status
        slug: String
        variants: [Variant]
        createdBy: ID!
        updatedBy: ID
        shop: ID!
        createdAt: Float
        updatedAt: Float
        sku: String
    }

    input AttributeInput {
        key: String!
        value: String!
    }

    input VariantInput {
        name: String!
        price: Float!
        stock: Int
        attributes: [AttributeInput!]!
        sku: String!
        image: String
        status: Status
    }
 
    input CreateProductInput {
        name: String!
        description: String
        price: Float!
        images: [String]
        categories: [String]
        status: Status
        variants: [VariantInput]
        shop: ID!
        sku: String!
        keywords: String
    }
    type Mutation {
        ${operationsGraphql.createProduct.name}(input: CreateProductInput): Product
    }
`,
    resolvers: {
      Mutation: {
        [operationsGraphql.createProduct.name]: async (
          _,
          { input }: IInput<CreateProductInput>,
          context: IContextGraphQlValue
        ) => {
          const payload = { ...input };
          if (![Role.admin, Role.shop].includes(context.verifiedToken.role)) {
            throw new GraphQLError("Permission denied!");
          }
          const createdProduct = await ProductModel.create({
            ...payload,
            createdBy: context.verifiedToken._id,
            slug: slugify(`${payload.name} ${payload.sku} ${Date.now()}`, {
              lower: true,
              locale: "vi",
            }),
          });
          return createdProduct;
        },
      },
      Query: {},
    },
  };
};

export default productModule;
