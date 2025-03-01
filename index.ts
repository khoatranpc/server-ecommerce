import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express from "express";
import initGraphQlOptions from "./src/graphql/initGraphql";
import exampleModule from "./src/graphql/modules/exampleModule";
import userModule from "./src/graphql/modules/userModule";
import { config } from "dotenv";
import mongoose from "mongoose";
import { jwtUtils } from "./src/utils";
config();

const mongo_uri = process.env.MONGO_URI;
await mongoose.connect(mongo_uri);

const app = express();
const server = new ApolloServer({
  ...initGraphQlOptions(exampleModule(), userModule()),
});

await server.start();
app.use(cors());
app.use(express.json()),
  app.use(
    "/graphql",
    (req, res, next) => {
      return next();
    },
    expressMiddleware(server, {
      context: async ({ req }) => {
        const access_token = req.headers.authorization?.replace("Bearer ", "");
        if (access_token) {
          const verifiedToken = jwtUtils.verifyAccessToken(access_token);
          return {
            verifiedToken,
          };
        }
        return {};
      },
    })
  );
app.listen(4000, () => {
  console.log(`Server is running ${4000}`);
});
