"use strict";

var bcrypt   = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: { type: DataTypes.TEXT, unique: true, allowNull: false },
    password: { type: DataTypes.TEXT },
    episode_offset: { type: 'INTERVAL', allowNull: false, defaultValue: '0 days' },
    admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    facebookid: { type: DataTypes.TEXT },
    facebooktoken: { type: DataTypes.TEXT },
    googleid: { type: DataTypes.TEXT },
    googletoken: { type: DataTypes.TEXT },
    redditid: { type: DataTypes.TEXT },
    reddittoken: { type: DataTypes.TEXT }
  },
  {
    instanceMethods: {
      validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      }
    },
    classMethods: {
      generateHash: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
      },
      associate: function(models) {
        User.hasMany(models.TrackShow, {
          foreignKey: {
            fieldName: 'userid',
            allowNull: false
          }
        });
        User.hasMany(models.WatchedEpisodes, {
          foreignKey: {
            fieldName: 'userid',
            allowNull: false
          }
        });
        User.hasMany(models.Subreddits, {
          foreignKey: {
            fieldName: 'userid',
            allowNull: false
          }
        });
        User.hasMany(models.Imdb, {
          foreignKey: {
            fieldName: 'userid',
            allowNull: false
          }
        });
      }
    }
  });

  return User;
};