import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express from "express";
import uploadController from "./src/apis/upload";
import initGraphQlOptions from "./src/graphql/initGraphql";
import exampleModule from "./src/graphql/modules/exampleModule";
import userModule from "./src/graphql/modules/userModule";
import { config } from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import { jwtUtils } from "./src/utils";
import shopModule from "./src/graphql/modules/shopModule";
import categoryModule from "./src/graphql/modules/categoryModule";
config();

const mongo_uri = process.env.MONGO_URI;
await mongoose.connect(mongo_uri);

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);
const server = new ApolloServer({
  ...initGraphQlOptions(
    exampleModule(),
    userModule(),
    shopModule(),
    categoryModule()
  ),
});

await server.start();
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.post(
  "/upload/single",
  upload.single("file"),
  uploadController.uploadSingle
);
app.post(
  "/upload/multiple",
  upload.array("files"),
  uploadController.uploadMultiple
);

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
