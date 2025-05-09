import { Types } from "mongoose";
import { Role, ServicePackage, Status } from "../enum";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  dob: Date;
  phoneNumber: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  status: Status;
  role: Role;
}

export interface IAddress {
  // thành phố
  province: number;
  // quận huyện
  district: number;
  // phường/xã
  ward: number;
  // địa chỉ chi tiết
  detail: string;
}
export interface IShop {
  _id: string;
  address: IAddress;
  description: string;
  email: string;
  facebook: string;
  instagram: string;
  logo: string;
  name: string;
  phone: string;
  tiktok: string;
  youtube: string;
  servicePackage: ServicePackage;
  owner: IUser | string;
}

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  slug?: string;
  parentCategory?: Types.ObjectId | null | this;
  status: Status;
  imageUrl?: string;
  createdBy?: Types.ObjectId | IUser | null | any;
  updatedBy?: Types.ObjectId | IUser | null | any;
  shop?: Types.ObjectId | IUser | null | any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVariant {
  _id?: string;
  name: string;
  price: number;
  stock?: number;
  attributes: {
    key: string;
    value: string;
  }[];
  sku: string;
  imageIndex?: number;
  status?: Status;
}

export interface IProduct {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  categories: Types.ObjectId[];
  status?: Status;
  slug: string;
  variants?: IVariant[];
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  shop: Types.ObjectId;
  createdAt?: Date;
  sku: string;
  updatedAt?: Date;
  keywords?: string;
  stock: number;
}

export interface IPost {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: Types.ObjectId;
  tags?: string[];
  categories?: Types.ObjectId[];
  images?: string[];
  product?: Types.ObjectId;
  banner?: string;
  status?: Status;
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IComment {
  _id?: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  likes?: Types.ObjectId[];
  replies?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICartItem {
  _id?: Types.ObjectId;
  product: Types.ObjectId;
  variant: Types.ObjectId;
  quantity: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICart {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  status: Status;
  shop: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
