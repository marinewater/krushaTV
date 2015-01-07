"use strict";


module.exports = function(sequelize, DataTypes) {
	var Subreddits = sequelize.define("Subreddits", {
		subreddit: { type: DataTypes.TEXT, allowNull: false }
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
              .query('ALTER TABLE "' + Subreddits.tableName + '" ADD CONSTRAINT "' + Subreddits.tableName + '_show_user_unique" UNIQUE (showid, userid);')
              .catch(function(err){
                  if (!(err.name === 'SequelizeDatabaseError' && err.message === 'relation "' + Subreddits.tableName + '_show_user_unique" already exists')) {
                      if ((process.env.NODE_ENV || "development") === 'development')
                          console.log(err);
                  }
              });

          sequelize
              .query('ALTER TABLE "' + Subreddits.tableName + '" ADD CONSTRAINT "' + Subreddits.tableName + '_check_subreddit" CHECK (subreddit ~* \'^/r/[A-Za-z0-9]+$\'::text)')
              .catch(function(err){
                  if (!(err.name === 'SequelizeDatabaseError' && err.message === 'constraint "' + Subreddits.tableName + '_check_subreddit" for relation "Subreddits" already exists')) {
                      if ((process.env.NODE_ENV || "development") === 'development')
                          console.log(err);
                  }
              });
      } 
    }
  });

	return Subreddits;
};