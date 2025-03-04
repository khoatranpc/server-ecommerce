import { ServicePackage } from "./enum";

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
