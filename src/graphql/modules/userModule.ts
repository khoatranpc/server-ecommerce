import { GraphQLError, GraphQLTypeResolver } from "graphql";
import UserModel from "../../models/users";
import { IInput, IModules, IObj } from "../../types";
import {
  comparePassword,
  hashPassword,
  jwtUtils,
  operationsGraphql,
} from "../../utils";
import {
  GetCurrentUserInput,
  UserLoginInput,
  UserRegisterInput,
} from "../../graphql-types";
const userModule = (): IModules => {
  return {
    typeDefs: `#graphql
            type User {
                _id: ID
                name: String
                email: String
                password: String
                dob: Float
                phoneNumber: String
                address: String
                createdAt: Float
                updatedAt: Float
                status: String
                role: String
            }
            input UserRegisterInput {
                name: String!
                email: String!
                password: String!
                dob: Float!
                phoneNumber: String!
                address: String!
            }
            input UserLoginInput {
              email: String!
              password: String!
            }

            type UserLoggedIn {
              access_token: String!
              refresh_token: String
            }
            type Mutation {
                ${operationsGraphql.userRegister.name}(input: UserRegisterInput): User
                ${operationsGraphql.userLogin.name}(input: UserLoginInput): UserLoggedIn
            }

            input GetCurrentUserInput {
                access_token: String!
            }
            type Query {
              ${operationsGraphql.getCurrentUser.name}(input: GetCurrentUserInput): User
            }
        `,
    resolvers: {
      Mutation: {
        [operationsGraphql.userRegister.name]: async (
          _: any,
          { input }: IInput<UserRegisterInput>
        ) => {
          const payload: UserRegisterInput = {
            ...input,
          };
          const hashedPassword = hashPassword(payload.password);
          const createdUser = await UserModel.create({
            ...payload,
            password: hashedPassword,
          });
          return createdUser;
        },
        [operationsGraphql.userLogin.name]: async (
          _: any,
          { input }: IInput<UserLoginInput>
        ) => {
          const payload: UserLoginInput = {
            ...input,
          };
          const currentUser = await UserModel.findOne({
            email: payload.email.toString(),
          });
          if (!currentUser)
            throw new GraphQLError("Email hoặc mật khẩu không đúng!");
          const checkPassword = comparePassword(
            payload.password,
            currentUser.password
          );
          if (!checkPassword)
            throw new GraphQLError("Email hoặc mật khẩu không đúng!");
          const access_token = jwtUtils.generateAccessToken({
            _id: currentUser._id.toString(),
            role: currentUser.role,
          });
          const refresh_token = jwtUtils.generateRefreshToken({
            _id: currentUser._id.toString(),
            role: currentUser.role,
          });
          return {
            refresh_token,
            access_token,
          };
        },
      },
      Query: {
        [operationsGraphql.getCurrentUser.name]: async (
          _,
          { input }: IInput<GetCurrentUserInput>,
          context
        ) => {
          const payload: GetCurrentUserInput = {
            ...input,
          };
          const verifiedToken = jwtUtils.verifyAccessToken(
            payload.access_token
          );
          const getCurrentUser = await UserModel.findById(verifiedToken._id);
          return getCurrentUser;
        },
      },
    },
  };
};

export default userModule;
