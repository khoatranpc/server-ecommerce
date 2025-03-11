import mongoose from "mongoose";
import { ICreateAPostInput, IGetOneProductInput } from "../../graphql-types";
import PostModel from "../../models/post";
import { IContextGraphQlValue, IInput, IModules } from "../../types";
import { checkRole, operationsGraphql } from "../../utils";
import { GraphQLError } from "graphql";
import { Role, Status } from "../../enum";
import slugify from "slugify";

const postModule = (): IModules => {
  return {
    typeDefs: `#graphql
      type Post {
          _id: ID
          title: String
          slug: String
          description: String
          content: String
          author: User
          tags: [String]
          categories: [Category]
          images: [String]
          product: Product
          banner: String
          status: Status
          views: Int
          createdAt: Float
          updatedAt: Float
      }
      type CreatedPostResponse {
          _id: ID
          title: String
          slug: String
          description: String
          content: String
          author: String
          tags: [String]
          categories: [String]
          images: [String]
          product: String
          banner: String
          status: Status
          views: Int
          createdAt: Float
          updatedAt: Float
      }
      input GetOnePostInput {
        value: String!
      }
      input CreateAPostInput {
        content: String!
        title: String!
        description: String!
        author: String
        tags: [String]
        categories: [String]
        images: [String]
        product: String
        banner: String
        status: String
      }

      type Query {
        ${operationsGraphql.getOnePost.name} (input: GetOnePostInput): Post
      }
      type Mutation {
        ${operationsGraphql.createAPost.name} (input: CreateAPostInput): CreatedPostResponse
      }
    `,
    resolvers: {
      Query: {
        [operationsGraphql.getOnePost.name]: async (
          _,
          { input }: IInput<IGetOneProductInput>,
          context: IContextGraphQlValue
        ) => {
          const payload = { ...input };
          const query = mongoose.Types.ObjectId.isValid(payload.value)
            ? {
                $or: [
                  {
                    _id: payload.value,
                  },
                  {
                    author: payload.value,
                  },
                  {
                    product: payload.value,
                  },
                ],
              }
            : {
                slug: payload.value,
              };
          const currentPost = await PostModel.findOne(query).populate(
            "author product categories"
          );
          if (!currentPost) throw new GraphQLError("Không tìm thấy bài viết!");
          if (![Role.admin, Role.shop].includes(context.verifiedToken.role)) {
            if (currentPost.status !== Status.active)
              throw new GraphQLError(
                "Bài viết không tồn tại hoặc chủ sỡ hữu đã xoá!"
              );
          }
          return currentPost;
        },
      },
      Mutation: {
        [operationsGraphql.createAPost.name]: async (
          _,
          { input }: IInput<ICreateAPostInput>,
          context: IContextGraphQlValue
        ) => {
          checkRole([Role.admin, Role.shop], context);
          const payload = { ...input };
          const createdPost = await PostModel.create({
            ...payload,
            author: context.verifiedToken._id,
            slug: slugify(`${payload.title} ${Date.now()}`, {
              lower: true,
              locale: "vi",
            }),
          });
          return createdPost;
        },
      },
    },
  };
};

export default postModule;
