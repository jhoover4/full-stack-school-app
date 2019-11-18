const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
  UserInputError
} = require("apollo-server");

const resolvers = {
  Query: {
    getCourse: async (root, { id }, { user, models }) => {
      if (!user) {
        throw new AuthenticationError("Route is protected.");
      }

      return models.Course.findByPk(id, {
        include: [
          {
            model: models.User,
            attributes: { exclude: ["password"] }
          }
        ]
      });
    },
    getCourses: async (root, { id }, { user, models }) => {
      if (!user) {
        throw new AuthenticationError("Route is protected.");
      }

      return models.Course.findAll({
        include: [
          {
            model: models.User,
            attributes: { exclude: ["password"] }
          }
        ]
      });
    },
    getUsers: async (root, { id }, { user, models }) => {
      if (!user) {
        throw new AuthenticationError("Route is protected.");
      }

      return models.User.findAll({
        attributes: { exclude: ["password"] }
      });
    },
    getCurrentUser: async (root, { id }, { user, models }) => {
      if (!user) {
        throw new AuthenticationError("Route is protected.");
      }

      const newUser = await models.User.findByPk(user.id, {
        include: [models.Course]
      });

      return models.User.findByPk(user.id, {
        include: [models.Course],
        attributes: { exclude: ["password"] }
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
          throw new ForbiddenError(
            "Don't have permission to update that course."
          );
        }
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          return new UserInputError("Course does not exist.");
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
        return new UserInputError("Course does not exist.");
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
      return course.User;
    }
  },
  User: {
    async courses(user) {
      return user.Courses;
    }
  }
};

module.exports = resolvers;
