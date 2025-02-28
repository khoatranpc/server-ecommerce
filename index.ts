import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import initGraphQlOptions from './src/graphql/initGraphql';
import exampleModule from './src/graphql/modules/exampleModule';

const app = express();
const server = new ApolloServer({
    ...initGraphQlOptions(exampleModule()),
});

await server.start();
app.use(express.json()),
    app.use(
        '/graphql',
        (req, res, next) => {
            return next();
        },
        cors<cors.CorsRequest>(),
        express.json(),
        expressMiddleware(server),
    );
app.listen(4000, () => {
    console.log(`Server is running ${4000}`);
})