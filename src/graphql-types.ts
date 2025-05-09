import { Types } from "mongoose";
import { Role, ServicePackage, Status } from "./enum";
import { IObj, IPaginateQuery } from "./types";

export interface UserRegisterInput {
  name: string;
  email: string;
  password: string;
  dob: number;
  phoneNumber: string;
  address: string;
  role: Role;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface GetCurrentUserInput {
  access_token: string;
}
type Address = {
  province: number;
  district: number;
  ward: number;
  detail: string;
};
export interface GetShopByOwnerIdInput {
  ownerId: string;
}

export interface SaveShopInfoInput {
  owner: string;

  address: Address;
  description: string;
  email: string;
  facebook: string;
  instagram: string;
  logo: string;
  name: string;
  phone: string;
  tiktok: String;
  youtube: string;
  servicePackage: ServicePackage;
}
export interface GetCategoriesInput {
  _id: string[];
  slug: string[];
  status: Status[];
  shop: string[];
  createdBy: string[];
  updatedBy: string[];
  keyword: string;
}

export interface FilterCategoriesInput {
  filter: GetCategoriesInput;
  paginate: IPaginateQuery;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  slug: string;
  parentCategory?: string;
  status: Status;
  imageUrl?: string;
  shop: string;
}
export interface CreateVariantProductInput {
  name: string;
  price: number;
  stock: number;
  attributes: IObj[];
  sku: string;
  imageIndex: number;
  status: Status;
}
export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  images: string[];
  categories: string[];
  status: Status;
  variants: CreateVariantProductInput[];
  shop: string;
  sku: string;
  stock: number;
}

export interface IProductFilterInput {
  name: String;
  categories: [String];
  status: [Status];
  shop: [String];
  sku: String;
  keywords: String;
  price: String;
}
export interface IGetProductsInput {
  filter: IProductFilterInput;
  paginate: IPaginateQuery;
}

export interface IGetProductBySlugInput {
  slug: string;
}

export interface IUpdateProductInput {
  _id: string;
  data: CreateProductInput;
}

export interface IGetOneProductInput {
  value: string;
}

export interface ICreateAPostInput {
  title: String;
  description: String;
  author: String;
  tags: [String];
  categories: [String];
  images: [String];
  product: String;
  banner: String;
  status: String;
}

export interface GetCartsInput {
  userId: string;
}

export interface InsertToCartInput {
  shop: Types.ObjectId;
  product: Types.ObjectId;
  variant: Types.ObjectId;
  quantity: Number;
  userId: Types.ObjectId;
}
