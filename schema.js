const { gql } = require("apollo-server");

const typeDefs = gql`
  type Course {
    title: String!
    description: String
    estimatedTime: String
    author: User!
  }

  type User {
    firstName: String
    lastName: String
    emailAddress: String
    courses: [Course]
  }

  type LoginResponse {
    token: String
    user: User
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each.
  type Query {
    getCourse(id: ID!): Course
    getCourses: [Course!]
    getUsers: [User!]
    getCurrentUser: User
  }

  type Mutation {
    register(
      firstName: String
      lastName: String
      emailAddress: String!
      password: String!
    ): LoginResponse
    login(emailAddress: String, password: String): LoginResponse
    createCourse(
      title: String!
      description: String
      estimatedTime: String
      materialsNeeded: String
    ): Course!
    updateCourse(
      id: ID!
      title: String!
      description: String
      estimatedTime: String
      materialsNeeded: String
    ): Course
    deleteCourse(id: ID!): String
  }
`;

module.exports = typeDefs;
