const resolvers = {
  Query: {
    getCourse: async (root, { id }, { models }) =>
      await models.Course.findByPk(id),
    getCourses: async (root, { id }, { models }) =>
      await models.Course.findAll(),
    getUsers: async (root, { id }, { models }) => await models.User.findAll()
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
    updateCourse: (source, { id }, { models }) => {
      // TODO: Grab userId somehow
      const userId = 1;

      try {
        const course = models.Course.find({
          include: [
            {
              where: { userId: userId }
            }
          ]
        });
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          return error;
        } else {
          throw error;
        }
      }

      return course;
    },
    deleteCourse: (source, { id }, { models }) => {
      const course = models.Course.findByPk(id);

      if (course) {
        course.destroy();
        return "success";
      } else {
        return "failure";
      }
    }
  },
  Course: {
    async author(course) {
      return await course.getUser();
    }
  },
  User: {
    async courses(user) {
      return await user.getCourses();
    }
  }
};

module.exports = resolvers;
