"use strict";

const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      hooks: {
        beforeCreate: user => {
          {
            user.password = user.password
              ? bcrypt.hashSync(user.password, 10)
              : "";
          }
        }
      }
    }
  );
  User.associate = function(models) {
    User.hasMany(models.Course);
  };

  User.prototype.isValidPassword = function(password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
