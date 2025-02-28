import { Status } from "../enum";

export interface IUser {
    name: string;
    email: string;
    password: string;
    dob: Date;
    phoneNumber: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
    status: Status;
}