"use strict";


module.exports = function(sequelize, DataTypes) {
	var Imdb = sequelize.define("Imdb", {
		imdb_id: { type: DataTypes.TEXT }
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
          if ((process.env.NODE_ENV || "development") === 'development')
            console.log(err);
        });
      } 
    }
  });

	return Imdb;
};