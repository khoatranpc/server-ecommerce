import { ApolloServerOptions } from "@apollo/server";
import { IModules, IObj } from "../types";



type IModuleOptions = IModules[]

const initGraphQlOptions = (...modules: IModuleOptions): ApolloServerOptions<any> => {
    let typeDefs = `#graphql
        type Address {
            province: Int
            district: Int
            ward: Int
            detail: String
        }
        input AddressInput {
            province: Int
            district: Int
            ward: Int
            detail: String
        }

        enum ServicePackage {
            trial
            premium
            basic
        }
    `;
    const resolvers: IObj = {
        Query: {},
        Mutation: {}
    }
    modules.forEach((module) => {
        typeDefs += module.typeDefs;
        resolvers['Query'] = {
            ...resolvers['Query'],
            ...module.resolvers.Query
        };
        resolvers['Mutation'] = {
            ...resolvers['Mutation'],
            ...module.resolvers.Mutation
        };
    });
    if (!Object.keys(resolvers.Mutation).length) delete resolvers.Mutation;
    if (!Object.keys(resolvers.Query).length) delete resolvers.Query;
    return {
        typeDefs,
        resolvers,
    }
}

export default initGraphQlOptions;