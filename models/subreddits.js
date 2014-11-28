"use strict";


module.exports = function(sequelize, DataTypes) {
	var Subreddits = sequelize.define("Subreddits", {
		subreddit: { type: DataTypes.TEXT }
	},
  	{
    classMethods: {
      associate: function(models) {
        Subreddits.belongsTo(models.Series, {foreignKey: {
            fieldName: 'showid',
            allowNull: false
          }
        });
        Subreddits.belongsTo(models.User, {foreignKey: {
            fieldName: 'userid',
            allowNull: false
          }
        });
      },
      addConstraints: function(models) {
      sequelize
        .query('ALTER TABLE "' + Subreddits.tableName + '" ADD CONSTRAINT ' + Subreddits.tableName + '_show_user_unique UNIQUE (showid, userid);')
        .error(function(err){
              if (!(err.name === 'SequelizeDatabaseError' && err.message === 'error: relation "subreddits_show_user_unique" already exists')) {
                  if ((process.env.NODE_ENV || "development") === 'development')
                      console.log(err);
              }
        });
      } 
    }
  });

	return Subreddits;
};