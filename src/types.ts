export interface IResponsePaginated<T> {
  data: T;
  page: number;
  total: number;
  pages: number;
  limit: number;
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
