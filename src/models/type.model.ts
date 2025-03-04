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
