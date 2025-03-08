import { GraphQLError } from "graphql";
import { Role } from "../../enum";
import {
  CreateCategoryInput,
  FilterCategoriesInput,
  GetCategoriesInput,
} from "../../graphql-types";
import CategoryModel from "../../models/category";
import { IContextGraphQlValue, IInput, IModules } from "../../types";
import { operationsGraphql } from "../../utils";

const categoryModule = (): IModules => {
  return {
    typeDefs: `#graphql
        type Category {
            _id: ID
            name: String
            description: String
            slug: String
            parentCategory: Category
            status: Status
            imageUrl: String
            createdBy: User
            updatedBy: User
            shop: Shop
            createdAt: Float
            updatedAt: Float
        }

        input GetCategoriesInput {
            _id: [ID]
            slug: [String]
            status: [Status]
            shop: [ID]
            createdBy: [ID]
            updatedBy: [ID]
            keyword: String
        }

        input FilterCategoriesInput {
            filter: GetCategoriesInput
            paginate: PaginateInput
        }

        input CreateCategoryInput {
            name: String!
            description: String
            slug: String!
            parentCategory: String
            status: Status
            imageUrl: String
            shop: String!
        }

        type DataCategoriesFiltered {
            data: [Category]
            paginate: Paginated
        }
        type Query {
            ${operationsGraphql.getCategories.name}(input: FilterCategoriesInput): DataCategoriesFiltered
        }
        type Mutation {
            ${operationsGraphql.createCategory.name}(input: CreateCategoryInput): Category
        }
    `,
    resolvers: {
      Query: {
        [operationsGraphql.getCategories.name]: async (
          _,
          { input }: IInput<FilterCategoriesInput>,
          context: IContextGraphQlValue
        ) => {
          const {
            filter = {} as GetCategoriesInput,
            paginate = { page: 1, limit: 10 },
          } = input || {};
          const { page = 1, limit = 10 } = paginate;

          const query: any = {};
          if (filter._id?.length) query._id = { $in: filter._id };
          if (filter.slug?.length) query.slug = { $in: filter.slug };
          if (filter.status?.length) query.status = { $in: filter.status };
          if (filter.shop?.length) query.shop = { $in: filter.shop };
          if (filter.createdBy?.length)
            query.createdBy = { $in: filter.createdBy };
          if (filter.updatedBy?.length)
            query.updatedBy = { $in: filter.updatedBy };
          if (filter.keyword) {
            query.$or = [
              { name: { $regex: filter.keyword, $options: "i" } },
              { description: { $regex: filter.keyword, $options: "i" } },
              { slug: { $regex: filter.keyword, $options: "i" } },
            ];
          }

          const skip = (page - 1) * limit;
          const [categories, total] = await Promise.all([
            CategoryModel.find(query)
              .skip(skip)
              .limit(limit)
              .populate("parentCategory")
              .populate("createdBy")
              .populate("updatedBy")
              .populate("shop")
              .sort({ createdAt: -1 }),
            CategoryModel.countDocuments(query),
          ]);

          return {
            data: categories,
            paginate: {
              total,
              limit,
              page,
              pages: Math.ceil(total / limit),
            },
          };
        },
      },
      Mutation: {
        [operationsGraphql.createCategory.name]: async (
          _,
          { input }: IInput<CreateCategoryInput>,
          context: IContextGraphQlValue
        ) => {
          const payload = { ...input };
          if (![Role.admin, Role.shop].includes(context.verifiedToken.role)) {
            throw new GraphQLError("Permission denied!");
          }
          const createdCategory = await CategoryModel.create({
            ...payload,
            createdBy: context.verifiedToken._id,
            updatedBy: context.verifiedToken._id,
          });
          return createdCategory;
        },
      },
    },
  };
};

export default categoryModule;
