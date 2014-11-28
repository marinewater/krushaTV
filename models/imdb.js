"use strict";


module.exports = function(sequelize, DataTypes) {
	var Imdb = sequelize.define("Imdb", {
		imdb_id: { type: DataTypes.TEXT, allowNull: false }
	},
  	{
    classMethods: {
      associate: function(models) {
        Imdb.belongsTo(models.Series, {foreignKey: {
            fieldName: 'showid',
            allowNull: false
          }
        });
        Imdb.belongsTo(models.User, {foreignKey: {
            fieldName: 'userid',
            allowNull: false
          }
        });
      },
      addConstraints: function(models) {
          sequelize
            .query('ALTER TABLE "' + Imdb.tableName + '" ADD CONSTRAINT ' + Imdb.tableName + '_show_user_unique UNIQUE (showid, userid);')
            .error(function(err){
                  if (!(err.name === 'SequelizeDatabaseError' && err.message === 'error: relation "imdbs_show_user_unique" already exists')) {
                      if ((process.env.NODE_ENV || "development") === 'development')
                          console.log(err);
                  }
            });
      } 
    }
  });

	return Imdb;
};