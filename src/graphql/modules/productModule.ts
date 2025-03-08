import { IModules } from "./../../types";
const productModule = (): IModules => {
  return {
    typeDefs: `#graphql
     type Attribute {
        key: String!
        value: String!
    }

    type Variant {
        name: String!
        price: Float!
        stock: Int
        attributes: [Attribute!]!
        sku: String!
        images: String
        status: Status
    }
    type Product {
        id: ID!
        name: String!
        description: String
        price: Float!
        images: [String]
        category: ID!
        status: Status
        slug: String
        variants: [Variant]
        createdBy: ID!
        updatedBy: ID
        shop: ID!
        createdAt: Float
        updatedAt: Float
        sku: String
    }

    input AttributeInput {
        key: String!
        value: String!
    }

    input VariantInput {
        name: String!
        price: Float!
        stock: Int
        attributes: [AttributeInput!]!
        sku: String!
        images: String
        status: Status
    }
 
    input ProductInput {
        name: String!
        description: String
        price: Float!
        images: [String]
        category: ID!
        status: Status
        variants: [VariantInput]
        shop: ID!
        sku: String!
    }
`,
    resolvers: {
      Mutation: {},
      Query: {},
    },
  };
};

export default productModule;
