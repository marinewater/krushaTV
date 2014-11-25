"use strict";

module.exports = function(sequelize, DataTypes) {
	var Series = sequelize.define("Series", {
		showid: { type: DataTypes.INTEGER, unique: true, allowNull: false },
		name: { type: DataTypes.TEXT, unique: true, allowNull: false },
		genre: { type: DataTypes.TEXT },
		subreddit: { type: DataTypes.TEXT },
		ended: { type: DataTypes.BOOLEAN, allowNull: false },
		imdbid: {type: DataTypes.TEXT, unique: true }
	},
	{
		classMethods: {

			associate: function(models) {
				Series.hasMany(models.Episodes, {
					foreignKey: {
						fieldName: 'seriesid',
						allowNull: false
					}
				});
				Series.hasMany(models.TrackShow, {
					foreignKey: {
						fieldName: 'showid',
						allowNull: false
					}
				});
				Series.hasMany(models.Subreddits, {
					foreignKey: {
						fieldName: 'showid',
						allowNull: false
					}
				});
				Series.hasMany(models.Imdb, {
					foreignKey: {
						fieldName: 'showid',
						allowNull: false
					}
				});
			},

			getSearchVector: function() {
				return 'PostText';
			},

			addFullTextIndex: function() {

				if(sequelize.options.dialect !== 'postgres') {
					console.log('Not creating search index, must be using POSTGRES to do this');
					return;
				}

				var searchFields = ['name'];
				var Post = this;

				var vectorName = Post.getSearchVector();
				sequelize
					.query('ALTER TABLE "' + Post.tableName + '" ADD COLUMN "' + vectorName + '" TSVECTOR')
					.success(function() {
						return sequelize
						.query('UPDATE "' + Post.tableName + '" SET "' + vectorName + '" = to_tsvector(\'english\', ' + searchFields.join(' || \' \' || ') + ')')
						.error(function(err){
							if ((process.env.NODE_ENV || "development") === 'development')
								console.log(err);
						});
					}).success(function() {
						return sequelize
						.query('CREATE INDEX post_search_idx ON "' + Post.tableName + '" USING gin("' + vectorName + '");')
						.error(function(err){
							if ((process.env.NODE_ENV || "development") === 'development')
								console.log(err);
						});
					}).success(function() {
						return sequelize
						.query('CREATE TRIGGER post_vector_update BEFORE INSERT OR UPDATE ON "' + Post.tableName + '" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("' + vectorName + '", \'pg_catalog.english\', ' + searchFields.join(', ') + ')')
						.error(function(err){
							if ((process.env.NODE_ENV || "development") === 'development')
								console.log(err);
						});
				}).error(function(err){
					if ((process.env.NODE_ENV || "development") === 'development')
						console.log(err);
				});

			},

			search: function(query) {
				if(sequelize.options.dialect !== 'postgres') {
					console.log('Search is only implemented on POSTGRES database');
					return;
				}

				var Post = this;

				query += ':*';
				query = sequelize.getQueryInterface().escape(query).replace(/\s/gi, "|");

				return sequelize
					.query('SELECT * FROM "' + Post.tableName + '" WHERE "' + Post.getSearchVector() + '" @@ to_tsquery(\'english\', ' + query + ')', Post);
			}
		}
	});

	return Series;
};