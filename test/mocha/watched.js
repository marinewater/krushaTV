var should 	= require('should');
var request = require('supertest');

var env 	= process.env.NODE_ENV || "test";
process.env.NODE_ENV = env;

var app 	= require('../../server').app;

var models = require('../../models/index');

describe('Watched Episodes', function() {
    describe('logged out', function () {
        it('should return an unauthorized error', function (done) {
            request(app)
                .get('/api/watched/shows')
                .set('Content-Type', 'application/json')
                .expect(401)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 401);
                    res.body.should.have.property('message', 'not logged in');
                    done();
                });
        });
        it('should return an unauthorized error', function (done) {
            request(app)
                .get('/api/watched/shows/1/seasons')
                .set('Content-Type', 'application/json')
                .expect(401)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 401);
                    res.body.should.have.property('message', 'not logged in');
                    done();
                });
        });
        it('should return an unauthorized error', function (done) {
            request(app)
                .get('/api/watched/shows/1/seasons/1/episodes')
                .set('Content-Type', 'application/json')
                .expect(401)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 401);
                    res.body.should.have.property('message', 'not logged in');
                    done();
                });
        });
    });

    describe('logged in', function() {
        var user = null;

        before(function(done) {
            var newUser = {
                'username': 'test',
                'password': 'testtest'
            };

            user = request.agent(app);

            user
                .post('/api/signup')
                .set('Content-Type', 'application/json')
                .send(newUser)
                .end(function() {
                    done();
                });
        });

        after(function(done) {
            models.sequelize.query("DELETE FROM \"Users\";").then(function() {
                done();
            }).catch(function(err) {
                done(err);
            });
        });

        describe('show does not exist', function() {

            it('should return an not found error 1', function(done) {
                user
                    .get('/api/watched/shows')
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 404);
                        res.body.should.have.property('message', 'You have no watched shows');
                        done();
                    });
            });

            it('should return a not found error 2', function(done) {
                user
                    .get('/api/watched/shows/1/seasons')
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 404);
                        res.body.should.have.property('message', 'No watched episodes for showid 1');
                        done();
                    });
            });

            it('should return a not found error 3', function(done) {
                user
                    .get('/api/watched/shows/1/seasons/1/episodes')
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 404);
                        res.body.should.have.property('message', 'No watched episodes for showid 1 and season 1');
                        done();
                    });
            });
        });

        describe('show exists', function() {
            var show_id = null;
            var user_id = null;

            before(function(done) {
                models.Series.create({
                    'showid': 1,
                    'name': 'show',
                    'genre': 'na',
                    'ended': false,
                    'imdb_id': null
                }).then(function(show) {
                    show_id = show.dataValues.id;

                    models.User.findOne({ where: { 'username': 'test' } }).then(function(user) {
                        user_id = user.id;
                        models.TrackShow.create({
                            'showid': show_id,
                            'userid': user.id
                        }).then(function() {
                            done();
                        }).catch(function(err) {
                            done(err);
                        });
                    });
                }).catch(function(err) {
                    done(err);
                });
            });

            after(function(done) {
                models.sequelize.query("DELETE FROM \"TrackShows\";").then(function() {
                    models.sequelize.query("DELETE FROM \"Series\";").then(function() {
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
                }).catch(function(err) {
                    done(err);
                });
            });

            it('should return a not found error', function(done) {
                user
                    .get('/api/watched/shows')
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 404);
                        res.body.should.have.property('message', 'You have no watched shows');
                        done();
                    });
            });

            var episode_id;

            describe('episode exists', function() {
                before(function(done) {
                    models.Episodes.create({
                        'season': 1,
                        'episode': 1,
                        'title': 'nanana',
                        'airdate': '2013-12-31',
                        'update': true,
                        'seriesid': show_id
                    }).then( function( episode ) {

                        episode_id = episode.dataValues.id;

                        return models.WatchedEpisodes.create( {
                            userid: user_id,
                            episodeid: episode_id
                        } )

                    }).then(function() {
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
                });

                after(function(done) {
                    models.sequelize.query("DELETE FROM \"WatchedEpisodes\";")
                        .then( function() {
                            return models.sequelize.query("DELETE FROM \"Episodes\";");
                        })
                        .then(function() {
                            done();
                        }).catch(function(err) {
                            done(err);
                        });
                });

                it('should return an watched show', function(done) {
                    user
                        .get('/api/watched/shows')
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .end(function(err, res) {
                            should.not.exist(err);
                            res.body.should.have.property('type', 'shows');
                            res.body.should.have.property('shows');
                            res.body.shows[0].should.have.property('id', show_id);
                            res.body.shows[0].should.have.property('name', 'show');
                            res.body.should.have.property('seasons');
                            res.body.seasons[0].should.have.property('season', 1);
                            res.body.should.have.property('episodes');
                            res.body.episodes[0].should.have.property('id');
                            res.body.episodes[0].should.have.property('episode', 1);
                            res.body.episodes[0].should.have.property('title', 'nanana');
                            res.body.episodes[0].should.have.property('airdate', '2013-12-31T00:00:00.000Z');
                            done();
                        });
                });

                it('should return an watched season', function(done) {
                    user
                        .get('/api/watched/shows/' + show_id + '/seasons')
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .end(function(err, res) {
                            should.not.exist(err);
                            res.body.should.have.property('type', 'seasons');
                            res.body.should.have.property('seasons');
                            res.body.seasons[0].should.have.property('season', 1);
                            res.body.should.have.property('episodes');
                            res.body.episodes[0].should.have.property('id');
                            res.body.episodes[0].should.have.property('episode', 1);
                            res.body.episodes[0].should.have.property('title', 'nanana');
                            res.body.episodes[0].should.have.property('airdate', '2013-12-31T00:00:00.000Z');
                            done();
                        });
                });

                it('should return an watched episode', function(done) {
                    user
                        .get('/api/watched/shows/' + show_id + '/seasons/1/episodes')
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .end(function(err, res) {
                            should.not.exist(err);
                            res.body.should.have.property('type', 'episodes');
                            res.body.should.have.property('episodes');
                            res.body.episodes[0].should.have.property('id');
                            res.body.episodes[0].should.have.property('episode', 1);
                            res.body.episodes[0].should.have.property('title', 'nanana');
                            res.body.episodes[0].should.have.property('airdate', '2013-12-31T00:00:00.000Z');
                            done();
                        });
                });

                describe('added episode to unwatched shows', function() {
                    before(function(done) {
                        models.WatchedEpisodes.destroy({
                            where: {
                                'userid': user_id,
                                'episodeid': episode_id
                            }
                        }).then(function() {
                            done();
                        }).catch(function(err) {
                            done(err);
                        });
                    });

                    after(function(done) {
                        models.WatchedEpisodes.create( {
                            userid: user_id,
                            episodeid: episode_id
                        } )
                            .then( function() {
                                done();
                            })
                            .catch( function( error ) {
                                done( error );
                            })
                    });

                    it('should return an not found error for a show', function(done) {
                        user
                            .get('/api/watched/shows')
                            .set('Content-Type', 'application/json')
                            .expect(404)
                            .end(function(err, res) {
                                should.not.exist(err);
                                res.body.should.have.property('type', 'error');
                                res.body.should.have.property('code', 404);
                                res.body.should.have.property('message', 'You have no watched shows');
                                done();
                            });
                    });

                    it('should return an not found error for a season', function(done) {
                        user
                            .get('/api/watched/shows/' + show_id + '/seasons')
                            .set('Content-Type', 'application/json')
                            .expect(404)
                            .end(function(err, res) {
                                should.not.exist(err);
                                res.body.should.have.property('type', 'error');
                                res.body.should.have.property('code', 404);
                                res.body.should.have.property('message', 'No watched episodes for showid ' + show_id);
                                done();
                            });
                    });

                    it('should return an not found error for an episode', function(done) {
                        user
                            .get('/api/watched/shows/' + show_id + '/seasons/1/episodes')
                            .set('Content-Type', 'application/json')
                            .expect(404)
                            .end(function(err, res) {
                                should.not.exist(err);
                                res.body.should.have.property('type', 'error');
                                res.body.should.have.property('code', 404);
                                res.body.should.have.property('message', 'No watched episodes for showid ' + show_id + ' and season 1');
                                done();
                            });
                    });

                    describe('show is untracked', function() {
                        before(function(done) {
                            models.TrackShow.findOne({ where: { 'showid': show_id }})
                                .then( function() {
                                    done();
                                })
                                .catch(function(err) {
                                    done(err);
                                });
                        });

                        it('should return an not found error for a season', function(done) {
                            user
                                .get('/api/watched/shows/' + show_id + '/seasons')
                                .set('Content-Type', 'application/json')
                                .expect(404)
                                .end(function(err, res) {
                                    should.not.exist(err);
                                    res.body.should.have.property('type', 'error');
                                    res.body.should.have.property('code', 404);
                                    res.body.should.have.property('message', 'No watched episodes for showid ' + show_id);
                                    done();
                                });
                        });

                        it('should return an not found error for an episode', function(done) {
                            user
                                .get('/api/watched/shows/' + show_id + '/seasons/1/episodes')
                                .set('Content-Type', 'application/json')
                                .expect(404)
                                .end(function(err, res) {
                                    should.not.exist(err);
                                    res.body.should.have.property('type', 'error');
                                    res.body.should.have.property('code', 404);
                                    res.body.should.have.property('message', 'No watched episodes for showid ' + show_id + ' and season 1');
                                    done();
                                });
                        });
                    });
                });
            });
        });
    });
});