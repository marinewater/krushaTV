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
            .query('ALTER TABLE "' + Imdb.tableName + '" ADD CONSTRAINT "' + Imdb.tableName + '_show_user_unique" UNIQUE (showid, userid);')
            .catch(function(err){
                  if (!(err.name === 'SequelizeDatabaseError' && err.message === 'relation "' + Imdb.tableName + '_show_user_unique" already exists')) {
                      if ((process.env.NODE_ENV || "development") === 'development')
                          console.log(err);
                  }
            });

          sequelize
              .query('ALTER TABLE "' + Imdb.tableName + '" ADD CONSTRAINT "' + Imdb.tableName + '_check_imdb_id" CHECK (imdb_id ~* \'^tt[0-9]{7}$\'::text)')
              .catch(function(err){
                  if (!(err.name === 'SequelizeDatabaseError' && err.message === 'constraint "' + Imdb.tableName + '_check_imdb_id" for relation "' + Imdb.tableName + '" already exists')) {
                      if ((process.env.NODE_ENV || "development") === 'development')
                          console.log(err);
                  }
              });
      } 
    }
  });

	return Imdb;
};