const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

const resolvers = {
  Query: {
    getCourse: async (root, { id }, { user, models }) => {
      if (!user) {
        throw new AuthenticationError("Route is protected.");
      }

      return models.Course.findByPk(id);
    },
    getCourses: async (root, { id }, { user, models }) => {
      if (!user) {
        throw new AuthenticationError("Route is protected.");
      }

      return models.Course.findAll();
    },
    getUsers: async (root, { id }, { user, models }) => {
      if (!user) {
        throw new AuthenticationError("Route is protected.");
      }

      return models.User.findAll({
        attributes: ["firstName", "lastName", "emailAddress"]
      });
    },
    getCurrentUser: async (root, { id }, { user, models }) => {
      if (!user) {
        throw new AuthenticationError("Route is protected.");
      }

      return models.User.findByPk(user.id, {
        attributes: ["firstName", "lastName", "emailAddress"]
      });
    }
  },
  Mutation: {
    createCourse: (
      source,
      { title, description, estimatedTime, author },
      { models }
    ) => {
      try {
        return models.Course.create({
          title,
          description,
          estimatedTime,
          author
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          return error;
        } else {
          throw error;
        }
      }
    },
    updateCourse: async (source, { id }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError("Route is protected.");
      }

      try {
        const course = await models.Course.findByPk(id);

        if (course.userId !== user.id) {
          throw Error("Don't have permission to update that course.");
        }
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          return error;
        } else {
          throw error;
        }
      }

      return course;
    },
    deleteCourse: async (source, { id }, { models }) => {
      if (!user) {
        throw new AuthenticationError("Route is protected.");
      }

      const course = await models.Course.findByPk(id);

      if (course) {
        course.destroy();
        return "success";
      } else {
        return "failure";
      }
    },
    register: async (
      source,
      { firstName, lastName, emailAddress, password },
      { models }
    ) => {
      const user = await models.User.create({
        firstName,
        lastName,
        emailAddress,
        password
      });

      const token = jwt.sign(
        {
          id: user.id,
          username: user.emailAddress
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "30d"
        }
      );

      return {
        token,
        user
      };
    },
    login: async (source, { emailAddress, password }, { models }) => {
      const user = await models.User.findOne({
        where: {
          emailAddress
        }
      });
      if (!user) {
        throw new Error("Invalid email address");
      }

      const isValidPassword = await user.isValidPassword(password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.emailAddress
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "30d"
        }
      );

      return {
        token,
        user
      };
    }
  },
  Course: {
    async author(course) {
      return course.getUser();
    }
  },
  User: {
    async courses(user) {
      return user.getCourses();
    }
  }
};

module.exports = resolvers;
