var should 	= require('should');
var request = require('supertest');

var env 	= process.env.NODE_ENV || "test";
process.env.NODE_ENV = env;

var app 	= require('../../server').app;

var models = require('../../models/index');

describe('Calendar', function() {
    describe('logged out', function () {
        it('should return an unauthorized error (month)', function (done) {
            request(app)
                .get('/api/calendar/2014/1')
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

        it('should return an unauthorized error (week)', function (done) {
            request(app)
                .get('/api/calendar/2014/1/1/week')
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

        it('should return an unauthorized error (day)', function (done) {
            request(app)
                .get('/api/calendar/2014/1/1')
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
        var userid;

        before(function (done) {
            var newUser = {
                'username': 'test',
                'password': 'testtest'
            };

            user = request.agent(app);

            user
                .post('/api/signup')
                .set('Content-Type', 'application/json')
                .send(newUser)
                .expect(200)
                .end(function (err) {
                    models.User.find({ where: { username: 'test' } })
                        .then(function(user_data) {
                            userid = user_data.dataValues.id;
                            done();
                        })
                        .catch(done);
                });
        });

        after(function (done) {
            models.sequelize.query("DELETE FROM \"Users\";").then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        describe('month', function() {
            it('should return a Bad Request error for non integers', function(done) {
                user
                    .get('/api/calendar/a/b')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for month < 0', function(done) {
                user
                    .get('/api/calendar/2014/-1')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for month = 0', function(done) {
                user
                    .get('/api/calendar/2014/0')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for month > 12', function(done) {
                user
                    .get('/api/calendar/2014/13')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for years < 1900', function(done) {
                user
                    .get('/api/calendar/1899/12')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for years > 3000', function(done) {
                user
                    .get('/api/calendar/3001/12')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'month and year have to be integers (1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return an empty response', function(done) {
                user
                    .get('/api/calendar/2014/12')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('episodes', []);
                        res.body.should.have.property('type', 'episodes');
                        done();
                    });
            });
        });

        describe('week', function() {
            it('should return a Bad Request error for non integers', function(done) {
                user
                    .get('/api/calendar/a/b/c/week')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for month < 0', function(done) {
                user
                    .get('/api/calendar/2014/-1/1/week')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for month = 0', function(done) {
                user
                    .get('/api/calendar/2014/0/1/week')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for month > 12', function(done) {
                user
                    .get('/api/calendar/2014/13/1/week')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for years < 1900', function(done) {
                user
                    .get('/api/calendar/1899/12/1/week')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for years > 3000', function(done) {
                user
                    .get('/api/calendar/3001/12/1/week')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for days < 0', function(done) {
                user
                    .get('/api/calendar/2014/12/-1/week')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for days < 1', function(done) {
                user
                    .get('/api/calendar/2014/12/0/week')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for days > 31', function(done) {
                user
                    .get('/api/calendar/2014/12/32/week')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return an empty response', function(done) {
                user
                    .get('/api/calendar/2014/12/1/week')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('episodes', []);
                        res.body.should.have.property('type', 'episodes');
                        done();
                    });
            });
        });

        describe('day', function() {
            it('should return a Bad Request error for non integers', function(done) {
                user
                    .get('/api/calendar/a/b/c')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for month < 0', function(done) {
                user
                    .get('/api/calendar/2014/-1/1')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for month = 0', function(done) {
                user
                    .get('/api/calendar/2014/0/1')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for month > 12', function(done) {
                user
                    .get('/api/calendar/2014/13/1')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for years < 1900', function(done) {
                user
                    .get('/api/calendar/1899/12/1')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for years > 3000', function(done) {
                user
                    .get('/api/calendar/3001/12/1')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for days < 0', function(done) {
                user
                    .get('/api/calendar/2014/12/-1')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for days < 1', function(done) {
                user
                    .get('/api/calendar/2014/12/0')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return a Bad Request error for days > 31', function(done) {
                user
                    .get('/api/calendar/2014/12/32')
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'error');
                        res.body.should.have.property('code', 400);
                        res.body.should.have.property('message', 'day, month and year have to be integers (1 <= day <= 31; 1 <= month <= 12; 1900 <= year <= 3000)');
                        done();
                    });
            });

            it('should return an empty response', function(done) {
                user
                    .get('/api/calendar/2014/12/1')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('episodes', []);
                        res.body.should.have.property('type', 'episodes');
                        done();
                    });
            });
        });

        describe('with data', function() {
            var showid;
            var episodeid;

            before(function(done) {
                models.Series.create({
                    'showid': 1,
                    'name': 'test',
                    'ended': false
                }).then(function(show) {
                    showid = show.dataValues.id;
                    models.Episodes.create({
                        seriesid: showid,
                        episode: 2,
                        season: 3,
                        title: 'test episode',
                        airdate: '2014-12-31T23:59:59.000Z'
                    }).then(function(episode) {
                        episodeid = episode.dataValues.id;
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
                }).catch(function(err) {
                    done(err);
                });
            });

            after(function(done) {
                models.sequelize.query("DELETE FROM \"TrackShows\";").then(function() {
                    models.sequelize.query("DELETE FROM \"Episodes\";").then(function() {
                        models.sequelize.query("DELETE FROM \"Series\";").then(function () {
                            done();
                        }).catch(function (err) {
                            done(err);
                        });
                    });
                });
            });

            it('should return an empty response (month)', function(done) {
                user
                    .get('/api/calendar/2014/12')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('episodes', []);
                        res.body.should.have.property('type', 'episodes');
                        done();
                    });
            });

            it('should return an empty response (week)', function(done) {
                user
                    .get('/api/calendar/2014/12/30/week')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('episodes', []);
                        res.body.should.have.property('type', 'episodes');
                        done();
                    });
            });

            it('should return an empty response (day)', function(done) {
                user
                    .get('/api/calendar/2014/12/30')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('episodes', []);
                        res.body.should.have.property('type', 'episodes');
                        done();
                    });
            });

            describe('tracked', function() {
                var track;

                before(function(done) {
                    models.TrackShow.create({
                        userid: userid,
                        showid: showid
                    }).then(function(_track_) {
                        track = _track_;
                        done();
                    }).catch(done);
                });

                after(function(done) {
                    track.destroy().then(function() { done(); }).catch(done);
                });

                it('should return one episode (month)', function(done) {
                    user
                        .get('/api/calendar/2014/12')
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .end(function(err, res) {
                            should.not.exist(err);
                            res.body.should.have.property('type', 'episodes');
                            res.body.should.have.property('episodes');
                            res.body.episodes[0].should.have.property('airdate', '2014-12-31T23:59:59.000Z');
                            res.body.episodes[0].should.have.property('episode', 2);
                            res.body.episodes[0].should.have.property('id', showid);
                            res.body.episodes[0].should.have.property('name', 'test');
                            res.body.episodes[0].should.have.property('season', 3);
                            res.body.episodes[0].should.have.property('title', 'test episode');
                            res.body.episodes[0].should.have.property('watched', false);
                            done();
                        });
                });

                it('should return one episode (week)', function(done) {
                    user
                        .get('/api/calendar/2014/12/30/week')
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .end(function(err, res) {
                            should.not.exist(err);
                            res.body.should.have.property('type', 'episodes');
                            res.body.should.have.property('episodes');
                            res.body.episodes[0].should.have.property('airdate', '2014-12-31T23:59:59.000Z');
                            res.body.episodes[0].should.have.property('episode', 2);
                            res.body.episodes[0].should.have.property('id', showid);
                            res.body.episodes[0].should.have.property('name', 'test');
                            res.body.episodes[0].should.have.property('season', 3);
                            res.body.episodes[0].should.have.property('title', 'test episode');
                            res.body.episodes[0].should.have.property('watched', false);
                            done();
                        });
                });

                it('should return one episode (day)', function(done) {
                    user
                        .get('/api/calendar/2014/12/31')
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .end(function(err, res) {
                            should.not.exist(err);
                            res.body.should.have.property('type', 'episodes');
                            res.body.should.have.property('episodes');
                            res.body.episodes[0].should.have.property('airdate', '2014-12-31T23:59:59.000Z');
                            res.body.episodes[0].should.have.property('episode', 2);
                            res.body.episodes[0].should.have.property('id', showid);
                            res.body.episodes[0].should.have.property('name', 'test');
                            res.body.episodes[0].should.have.property('season', 3);
                            res.body.episodes[0].should.have.property('title', 'test episode');
                            res.body.episodes[0].should.have.property('watched', false);
                            done();
                        });
                });

                describe('watched episode', function() {
                    var watched_episode;
                    before(function(done) {
                        models.WatchedEpisodes.create({
                            userid: userid,
                            episodeid: episodeid
                        }).then(function(_watched_episode_) {
                            watched_episode = _watched_episode_;
                            done();
                        }).catch(done);
                    });

                    after(function(done) {
                        watched_episode.destroy().then(function() { done(); }).catch(done);
                    });

                    it('should return a watched episode (month)', function(done) {
                        user
                            .get('/api/calendar/2014/12')
                            .set('Content-Type', 'application/json')
                            .expect(200)
                            .end(function(err, res) {
                                should.not.exist(err);
                                res.body.episodes[0].should.have.property('watched', true);
                                done();
                            });
                    });

                    it('should return a watched episode (week)', function(done) {
                        user
                            .get('/api/calendar/2014/12/30/week')
                            .set('Content-Type', 'application/json')
                            .expect(200)
                            .end(function(err, res) {
                                should.not.exist(err);
                                res.body.episodes[0].should.have.property('watched', true);
                                done();
                            });
                    });

                    it('should return a watched episode (day)', function(done) {
                        user
                            .get('/api/calendar/2014/12/31')
                            .set('Content-Type', 'application/json')
                            .expect(200)
                            .end(function(err, res) {
                                should.not.exist(err);
                                res.body.episodes[0].should.have.property('watched', true);
                                done();
                            });
                    });
                });
            });
        });
    });
});
