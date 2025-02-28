import { Role, Status } from "../enum";

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