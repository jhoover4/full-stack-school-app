"use strict";

require("dotenv").config();
const express = require("express");
const db = require("./models");
const resolvers = require("./resolvers");
const typeDefs = require("./schema");
const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();
const port = process.env.PORT || 5000;

const getUser = token => {
  try {
    if (token) {
      return jwt.verify(token, process.env.SECRET_KEY);
    }
    return null;
  } catch (err) {
    return null;
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const tokenWithBearer = req.headers.authorization || "";
    const token = tokenWithBearer.split(" ")[1];
    const user = getUser(token);

    return { user, models: db };
  }
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
