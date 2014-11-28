"use strict";

var bcrypt   = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: { type: DataTypes.TEXT, unique: true, allowNull: false },
    password: { type: DataTypes.TEXT },
    episode_offset: { type: 'INTERVAL', allowNull: false, defaultValue: '0 days' },
    admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    date_format: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'yyyy-MM-dd'},
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
      },
      addConstraints: function(models) {
        sequelize
            .query('ALTER TABLE "' + User.tableName + '" ADD CONSTRAINT "' + User.tableName + '_check_date_format" CHECK (date_format ~ \'^((d|M){2}|y{4})[./-]((d|M){2}|y{4})[./-]((d|M){2}|y{4})$\'::text)')
            .error(function(err){
              if (!(err.name === 'SequelizeDatabaseError' && err.message === 'error: constraint "' + User.tableName + '_check_date_format" for relation "' + User.tableName + '" already exists')) {
                if ((process.env.NODE_ENV || "development") === 'development')
                  console.log(err);
              }
            });
      }
    }
  });

  return User;
};