"use strict";
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      estimatedTime: DataTypes.STRING,
      materialsNeeded: DataTypes.STRING
    },
    {}
  );
  Course.associate = function(models) {
    Course.belongsTo(models.User, { foreignKey: 'userId' });
  };
  return Course;
};
