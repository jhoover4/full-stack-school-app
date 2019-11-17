"use strict";

// load modules
const express = require("express");
const db = require("./models");
const resolvers = require("./resolvers");
const typeDefs = require('./schema');
const { ApolloServer } = require("apollo-server");

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();
const port = process.env.PORT || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { models: db }
});

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!"
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found"
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// set our port
app.set("port", port);

// start listening on our port
db.sequelize.sync().then(() => {
  server.listen({ port }, "/graphql", () =>
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}graphql`
    )
  );
});
