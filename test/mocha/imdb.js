var should 	= require('should');
var request = require('supertest');

var env 	= process.env.NODE_ENV || "test";
process.env.NODE_ENV = env;

var app 	= require('../../server').app;

var models = require('../../models/index');

describe('IMDb', function() {
    describe('logged out', function() {
        it('should return an unauthorized error', function(done) {
            request(app)
                .post('/api/imdb')
                .set('Content-Type', 'application/json')
                .send({
                    'showid': 27,
                    'imdb_id': 'tt1234567'
                })
                .expect(401)
                .end(function(err, res) {
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
                .expect(200)
                .end(function(err) {
                    done(err);
                });
        });

        after(function(done) {
            models.sequelize.query("DELETE FROM \"Users\";").success(function() {
                done();
            }).error(function(err) {
                done(err);
            });
        });

        it('should return an not found error', function(done) {
            user
                .post('/api/imdb')
                .set('Content-Type', 'application/json')
                .send({
                    'showid': 27,
                    'imdb_id': 'tt1234567'
                })
                .expect(404)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 404);
                    res.body.should.have.property('message', 'show does not exist');
                    done();
                });
        });

        describe('show exists', function() {
            var showid = null;
            before(function(done) {
                models.Series.create({
                    'showid': 1,
                    'name': 'test',
                    'ended': false
                }).success(function(show) {
                    showid = show.dataValues.id;
                    done();
                }).error(function(err) {
                    done(err);
                });
            });

            after(function(done) {
                models.sequelize.query("DELETE FROM \"Series\";").success(function() {
                    done();
                }).error(function(err) {
                    done(err);
                });
            });

            it('should create an entry for an imdb id', function(done) {
                user
                    .post('/api/imdb')
                    .set('Content-Type', 'application/json')
                    .send({
                        'showid': showid,
                        'imdb_id': 'tt1234567'
                    })
                    .expect(201)
                    .end(function(err) {
                        should.not.exist(err);

                        models.sequelize.query("DELETE FROM \"Imdbs\";").success(function() {
                            done();
                        });
                    });
            });

            it('should return an error that the imdb id is not valid', function(done) {
                user
                    .post('/api/imdb')
                    .set('Content-Type', 'application/json')
                    .send({
                        'showid': showid,
                        'imdb_id': 'tt12345672'
                    })
                    .expect(400)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('message', 'imdb_id is not a valid imdb id');
                        done();
                    });
            });
        });
    });
});