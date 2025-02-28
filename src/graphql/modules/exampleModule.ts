import { IModules } from "../../types";
import { operationsGraphql } from "../../utils";

const examples = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster',
    },
];
const exampleModule = (): IModules => {
    const typeDefs = `#graphql
        type Example {
            title: String
            author: String
        }
        type Query {
            ${operationsGraphql.examples.name}: [Example]
        }
    `;
    const resolvers = {
        Query: {
            [operationsGraphql.examples.name]: () => {
                return examples;
            },
        },
        Mutation: {

        }
    };
    return {
        typeDefs,
        resolvers
    }
}

export default exampleModule;