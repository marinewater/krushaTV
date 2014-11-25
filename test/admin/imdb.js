var should 	= require('should');
var request = require('supertest');

var env 	= process.env.NODE_ENV || "test";
process.env.NODE_ENV = env;

var app 	= require('../../server').app;

var models = require('../../models/index');

describe('Admin - IMDb', function() {
    describe('logged out', function() {
        it('should return an unauthorized error', function(done) {
            request(app)
                .get('/api/admin/imdb')
                .set('Content-Type', 'application/json')
                .expect(401)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 401);
                    res.body.should.have.property('message', 'not logged in');
                    done();
                });
        });

        it('should return an unauthorized error', function(done) {
            request(app)
                .put('/api/admin/imdb/1')
                .set('Content-Type', 'application/json')
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
        var admin = null;

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
                    var newAdmin = {
                        'username': 'admin',
                        'password': 'adminadmin'
                    };

                    admin = request.agent(app);

                    admin
                        .post('/api/signup')
                        .set('Content-Type', 'application/json')
                        .send(newAdmin)
                        .end(function() {
                            models.User.update({ 'admin': true }, { where: { 'username': 'admin' } }).success(function() { done(); });
                        });
                });
        });

        after(function(done) {
            models.sequelize.query("DELETE FROM \"Users\";").success(function() {
                done();
            }).error(function(err) {
                done(err);
            });
        });

        it('should return an forbidden error', function(done) {
            user
                .get('/api/admin/imdb')
                .set('Content-Type', 'application/json')
                .expect(403)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 403);
                    res.body.should.have.property('message', 'you do not have access to this resource');
                    done();
                });
        });

        it('should return an forbidden error', function(done) {
            user
                .put('/api/admin/imdb/1')
                .set('Content-Type', 'application/json')
                .expect(403)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 403);
                    res.body.should.have.property('message', 'you do not have access to this resource');
                    done();
                });
        });

        it('should return a not found error', function(done) {
            admin
                .get('/api/admin/imdb')
                .set('Content-Type', 'application/json')
                .expect(404)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 404);
                    res.body.should.have.property('message', 'no imdb ids submitted');
                    done();
                });
        });

        it('should return a not found error', function(done) {
            admin
                .put('/api/admin/imdb/1')
                .set('Content-Type', 'application/json')
                .expect(404)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('type', 'error');
                    res.body.should.have.property('code', 404);
                    res.body.should.have.property('message', 'submission_id does not exist');
                    done();
                });
        });

        describe('with show available', function() {
            var show_id = null;
            var submission_id = null;

            before(function(done) {
                models.Series.create({
                    'showid': 1,
                    'name': 'show',
                    'genre': 'na',
                    'ended': false,
                    'imdb_id': null
                }).success(function(show) {
                    show_id = show.dataValues.id;

                    models.User.findOne({ where: { 'username': 'test' } }).success(function(user) {
                        models.Imdb.create({
                            'showid': show_id,
                            'userid': user.dataValues.id,
                            'imdb_id': 'tt1234567'
                        }).success(function(imdb) {
                            submission_id = imdb.dataValues.id;
                            done();
                        }).error(function(err) {
                            done(err);
                        });
                    }).error(function(err) {
                        done(err);
                    });
                }).error(function(err) {
                    done(err);
                });
            });

            after(function(done) {
                models.sequelize.query("DELETE FROM \"Series\";").success(function() {
                    models.sequelize.query("DELETE FROM \"Imdbs\";").success(function() {
                        done();
                    }).error(function(err) {
                        done(err);
                    });
                }).error(function(err) {
                    done(err);
                });
            });

            it('should list imdb ids', function(done) {
                admin
                    .get('/api/admin/imdb')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'submitted_imdb_ids');
                        res.body.imdb_ids.should.have.length(1);
                        res.body.imdb_ids[0].should.have.property('showid', show_id);
                        res.body.imdb_ids[0].should.have.property('imdb_id', 'tt1234567');
                        res.body.imdb_ids[0].should.have.property('showname', 'show');
                        res.body.imdb_ids[0].should.have.property('id', submission_id);
                        done();
                    });
            });

            it('should accept imdb id', function(done) {
                admin
                    .put('/api/admin/imdb/' + submission_id)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function(err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('type', 'imdb_submission');
                        res.body.should.have.property('result', 'accepted');

                        models.Series.findOne({ where: { 'id': show_id }}).success(function(show) {
                            show.dataValues.should.have.property('imdbid', 'tt1234567');
                            models.Imdb.count({
                                where: {
                                    'showid': show_id
                                }
                            }).success(function(imdb_count) {
                                imdb_count.should.be.equal(0);
                                done();
                            }).error(function(err) {
                                done(err);
                            })
                        }).error(function(err) {
                            done(err);
                        });
                    });
            });
        });
    });
});