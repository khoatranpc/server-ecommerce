import { ServicePackage, Status } from "./enum";
import { IObj, IPaginateQuery } from "./types";

export interface UserRegisterInput {
  name: string;
  email: string;
  password: string;
  dob: number;
  phoneNumber: string;
  address: string;
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
  images: string;
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
