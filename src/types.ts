import { Role } from "./enum";

export interface IPaginateQuery {
  page: number;
  limit: number;
}

export interface IPaginated {
  page: number;
  total: number;
  pages: number;
  limit: number;
}
export interface IResponsePaginated<T> {
  data: T;
  paginate: IPaginated;
}

export interface IObj {
  [k: string]: any;
}
export interface IModules {
  typeDefs: string;
  resolvers: {
    Query: IObj;
    Mutation: IObj;
  };
}

export interface IInput<T> {
  input: T;
}

export interface IContextGraphQlValue {
  verifiedToken: {
    _id: string;
    role: Role;
  };
}
