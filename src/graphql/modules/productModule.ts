import { GraphQLError } from "graphql";
import { Role } from "../../enum";
import {
  CreateProductInput,
  IGetProductsInput,
  IProductFilterInput,
} from "../../graphql-types";
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
        image: String
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
        stock: Int
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
    input ProductFilterInput {
      name: String
      categories: [String]
      status: [Status]
      shop: [String]
      sku: String
      keywords: String
    }
    input GetProductsInput {
      filter: ProductFilterInput
      paginate: PaginateInput
    }
    type ProductResponse {
        _id: ID!
        name: String!
        description: String
        price: Float!
        images: [String]
        category: ID!
        status: Status
        slug: String
        variants: [Variant]
        createdBy: User
        updatedBy: User
        shop: Shop
        createdAt: Float
        updatedAt: Float
        sku: String
        stock: String
    }
    type Products {
      data: [ProductResponse]
      paginate: Paginated
    }
    type Mutation {
        ${operationsGraphql.createProduct.name}(input: CreateProductInput): Product
    }
    type Query {
        ${operationsGraphql.getProducts.name}(input: GetProductsInput): Products
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
            updatedBy: context.verifiedToken._id,
            slug: slugify(`${payload.name} ${payload.sku} ${Date.now()}`, {
              lower: true,
              locale: "vi",
            }),
          });
          return createdProduct;
        },
      },
      Query: {
        [operationsGraphql.getProducts.name]: async (
          __dirname,
          { input }: IInput<IGetProductsInput>
        ) => {
          const {
            filter = {} as IProductFilterInput,
            paginate = { page: 1, limit: 10 },
          } = input || {};
          const { page = 1, limit = 10 } = paginate;
          const query: any = {};
          if (filter.status?.length) query.status = { $in: filter.status };
          if (filter.shop?.length) query.shop = { $in: filter.shop };
          if (filter.categories?.length)
            query.shop = { $in: filter.categories };
          if (filter.keywords) {
            query.$or = [
              { name: { $regex: filter.keywords, $options: "i" } },
              { slug: { $regex: filter.keywords, $options: "i" } },
            ];
          }
          if (filter.sku) {
            query.$or = [{ name: { $regex: filter.sku, $options: "i" } }];
          }

          const skip = (page - 1) * limit;
          const [products, total] = await Promise.all([
            ProductModel.find(query)
              .skip(skip)
              .limit(limit)
              .populate("categories")
              .populate("createdBy")
              .populate("updatedBy")
              .populate({
                path: "shop",
                populate: {
                  path: "owner",
                },
              })
              .sort({ createdAt: -1 }),
            ProductModel.countDocuments(query),
          ]);
          return {
            data: products,
            paginate: {
              total,
              limit,
              page,
              pages: Math.ceil(total / limit),
            },
          };
        },
      },
    },
  };
};

export default productModule;
