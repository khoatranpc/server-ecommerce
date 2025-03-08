import { OperationStatus, Role } from "./enum";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { GraphQLError } from "graphql";
import { IContextGraphQlValue } from "./types";
config();

export const operationsGraphql = {
  examples: {
    name: "examples",
    status: OperationStatus.active,
  },
  userRegister: {
    name: "userRegister",
    status: OperationStatus.active,
  },
  userLogin: {
    name: "userLogin",
    status: OperationStatus.active,
  },
  getCurrentUser: {
    name: "getCurrentUser",
    status: OperationStatus.active,
  },
  getShopByOwnerId: {
    name: "getShopByOwnerId",
    status: OperationStatus.active,
  },
  updateShopInfo: {
    name: "getShopByOwnerId",
    status: OperationStatus.active,
  },
  createShopInfo: {
    name: "createShopInfo",
    status: OperationStatus.active,
  },
  getCategories: {
    name: "getCategories",
    status: OperationStatus.active,
  },
  createCategory: {
    name: "createCategory",
    status: OperationStatus.active,
  },
  createProduct: {
    name: "createProduct",
    status: OperationStatus.active,
  },
};

export const hashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = (
  password: string,
  hashedPassword: string
): boolean => {
  return bcrypt.compareSync(password, hashedPassword);
};

export const jwtUtils = {
  generateAccessToken: (payload: any): string => {
    return jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "17d",
    });
  },

  generateRefreshToken: (payload: any): string => {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || "refresh_secret",
      {
        expiresIn: "7d",
      }
    );
  },

  verifyAccessToken: (token: string): any => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "secret");
    } catch (error) {
      if (error.message === "jwt expired") {
        throw new GraphQLError("Hết hạn đăng nhập, vui lòng đăng nhập lại");
      }
      throw new GraphQLError("Xảy ra lỗi khi xác thực thông tin!");
    }
  },

  verifyRefreshToken: (refreshToken: string): any => {
    try {
      return jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "refresh_secret"
      );
    } catch (error) {
      throw new GraphQLError(error.message);
    }
  },

  generateNewAccessToken: (refreshToken: string): string | null => {
    const payload = jwtUtils.verifyRefreshToken(refreshToken);
    if (!payload) return null;
    if (typeof payload === "object") {
      delete payload.exp;
      delete payload.iat;
    }
    return jwtUtils.generateAccessToken(payload);
  },
};

export const checkRole = (
  role: Role[],
  contextGraphQl: IContextGraphQlValue
) => {
  if (!role.includes(contextGraphQl.verifiedToken.role))
    throw new GraphQLError("Permission denied!");
};
