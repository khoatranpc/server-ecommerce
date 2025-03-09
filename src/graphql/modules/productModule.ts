import { GraphQLError } from "graphql";
import { Role, Status } from "../../enum";
import {
  CreateProductInput,
  IGetProductBySlugInput,
  IGetProductsInput,
  IProductFilterInput,
  IUpdateProductInput,
} from "../../graphql-types";
import { checkRole, operationsGraphql } from "../../utils";
import { IContextGraphQlValue, IInput, IModules, IObj } from "./../../types";
import ProductModel from "../../models/product";
import slugify from "slugify";
import mongoose from "mongoose";
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
        imageIndex: Int
        status: Status
    }
    type Product {
        _id: ID!
        name: String!
        description: String
        price: Float!
        images: [String]
        categories: [Category]
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
        _id: String
        name: String!
        price: Float!
        stock: Int
        attributes: [AttributeInput!]!
        sku: String!
        imageIndex: Int
        status: Status
    }
 
    input CreateProductInput {
        _id: String
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
        stock: Int
        updatedBy: String
    }
    input ProductFilterInput {
      name: String
      categories: [String]
      status: [Status]
      shop: [String]
      sku: String
      keywords: String
      price: String
    }
    input GetProductsInput {
      filter: ProductFilterInput
      paginate: PaginateInput
    }

    input GetProductBySlugInput {
      slug: String!
    }

    input UpdateProductInput {
      _id: String!
      data: CreateProductInput
    }

    type ProductResponse {
        _id: ID!
        name: String!
        description: String
        price: Float!
        images: [String]
        categories: [Category]
        status: Status
        slug: String
        variants: [Variant]
        createdBy: User
        updatedBy: User
        shop: Shop
        createdAt: Float
        updatedAt: Float
        sku: String
        stock: Int
    }
    type Products {
      data: [ProductResponse]
      paginate: Paginated
    }
    type Mutation {
        ${operationsGraphql.createProduct.name}(input: CreateProductInput): Product
        ${operationsGraphql.updateProductById.name}(input: UpdateProductInput): Product
    }
    type Query {
        ${operationsGraphql.getProducts.name}(input: GetProductsInput): Products
        ${operationsGraphql.getProductBySlug.name}(input: GetProductBySlugInput): ProductResponse
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
        [operationsGraphql.updateProductById.name]: async (
          _,
          { input }: IInput<IUpdateProductInput>,
          context: IContextGraphQlValue
        ) => {
          const payload = {
            ...input,
          };
          checkRole([Role.admin, Role.shop], context);
          if (context.verifiedToken.role === Role.shop) {
            const currentProduct = await ProductModel.findOne({
              _id: payload._id,
              createdBy: context.verifiedToken._id,
            });
            if (!currentProduct) throw new GraphQLError("Permission denied!");
          }
          delete (payload.data as IObj)._id;
          const saveProduct = await ProductModel.findByIdAndUpdate(
            payload._id,
            {
              ...payload.data,
              updatedBy: context.verifiedToken._id,
            },
            {
              new: true,
            }
          );
          return saveProduct;
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
          const query: any = { $and: [] };

          if (filter.status?.length) {
            query.$and.push({ status: { $in: filter.status } });
          } else {
            query.$and.push({ status: { $in: [Status.active] } });
          }

          if (filter.shop?.length) {
            query.$and.push({ shop: { $in: filter.shop } });
          }

          if (filter.categories?.length) {
            query.$and.push({ categories: { $in: filter.categories } });
          }

          if (filter.keywords && typeof filter.keywords === "string") {
            const sanitizedKeywords = filter.keywords.trim();
            if (sanitizedKeywords.length > 0) {
              const regex = new RegExp(`\\b${sanitizedKeywords}`, "i");
              query.$and.push({
                $or: [
                  { name: { $regex: regex } },
                  { slug: { $regex: regex } },
                  { keywords: { $regex: regex } },
                ],
              });
            }
          }
          if (filter.sku && typeof filter.sku === "string") {
            const sanitizedSku = filter.sku.trim();
            if (sanitizedSku.length > 0) {
              query.$and.push({
                sku: { $regex: new RegExp(sanitizedSku, "i") },
              });
            }
          }

          if (filter.price) {
            const [minPrice, maxPrice] = filter.price.split(",").map(Number);
            const priceFilter: any = {};

            if (!isNaN(minPrice)) priceFilter.$gte = minPrice;
            if (
              !isNaN(maxPrice) &&
              (!isNaN(minPrice) ? maxPrice >= minPrice : true)
            ) {
              priceFilter.$lte = maxPrice;
            }

            if (Object.keys(priceFilter).length) {
              query.$and.push({
                $or: [
                  { price: priceFilter },
                  { variants: { $elemMatch: { price: priceFilter } } },
                ],
              });
            }
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
        [operationsGraphql.getProductBySlug.name]: async (
          _,
          { input }: IInput<IGetProductBySlugInput>,
          context: IContextGraphQlValue
        ) => {
          const payload = { ...input };

          const query = mongoose.Types.ObjectId.isValid(payload.slug)
            ? { _id: payload.slug }
            : { slug: payload.slug };

          const currentProduct = await ProductModel.findOne(query)
            .populate("categories")
            .populate("createdBy")
            .populate("updatedBy")
            .populate({
              path: "shop",
              populate: {
                path: "owner",
              },
            })
            .lean();
          if (
            currentProduct &&
            [Status.deleted, Status.inactive, Status.pending].includes(
              currentProduct.status
            )
          ) {
            checkRole(
              [Role.admin, Role.shop],
              context,
              "Sản phẩm hiện không khả dụng!"
            );
          }
          if (!currentProduct)
            throw new GraphQLError("Không tìm thấy thông tin sản phẩm!");
          return currentProduct;
        },
      },
    },
  };
};

export default productModule;
