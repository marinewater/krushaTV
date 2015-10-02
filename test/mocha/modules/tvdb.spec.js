var should = require( 'should' );
var proxyquire = require( 'proxyquire').noPreserveCache();
var Promise = require( 'bluebird' );

var env = process.env.NODE_ENV || "test";
process.env.NODE_ENV = env;

describe('tvdb', function() {
    
    describe( 'Constructor', function() {

        var tvdb;

        before( function() {
            tvdb = require( __dirname + '/../../../app/modules/tvdb' );
        });

        it( 'should fail to initialize without an api key', function() {

            should.throws( function() {
                return new tvdb();
            }, Error );

        });

        it( 'should set api key', function() {

            var tv = new tvdb( 'test_key' );

            should.strictEqual( tv.api_key, 'test_key' );

        });

        it( 'should set default options', function() {

            var tv = new tvdb( 'test_key' );

            should.deepEqual( tv.options, {
                base_url: 'https://api-beta.thetvdb.com/',
                language: null
            });

        });

        it( 'should override default options', function() {

            var tv = new tvdb( 'test_key', {
                base_url: 'http://notthetvdb.com/api/',
                language: 'en'
            });

            should.deepEqual( tv.options, {
                base_url: 'http://notthetvdb.com/api/',
                language: 'en'
            });

        });

    });

    describe( 'login', function() {

        var tvdb;

        before( function() {

            tvdb = proxyquire( __dirname + '/../../../app/modules/tvdb', {
                request: function( options, callback ) {

                    callback( null, null, {
                        token: 'test-token'
                    });
                }
            });

        });

        it( 'should set the token', function( done ) {

            var tv = new tvdb( 'test_key' );

            tv.login()
                .then( function() {

                    should.strictEqual( tv.token, 'test-token');
                    done();
                })
                .catch( function( err ) {

                    done( err );

                });
        })
    });

    describe( 'SearchSeries', function() {

        var tvdb;

        before( function() {

            tvdb = proxyquire( __dirname + '/../../../app/modules/tvdb', {
                request: function( options, callback ) {

                    if ( options.uri == '/login' ) {

                        callback( null, null, {
                            token: 'test-token'
                        });

                    }
                    else {

                        callback( null, null, '{' +
                            '"data": [' +
                            '    {' +
                            '       "aliases": [' +
                            '           "test_alias"' +
                            '       ],' +
                            '       "banner": "graphical/test-banner.jpg",' +
                            '       "firstAired": "1234-01-02",' +
                            '       "id": 12345,' +
                            '       "network": "test_tv-station",' +
                            '       "overview": "test description",' +
                            '       "seriesName": "test_series",' +
                            '       "status": "Continuing"' +
                            '   }' +
                            ']' +
                        '}');

                    }
                }
            })

        });

        it( 'should throw am error if no token is present', function() {

            var tv = new tvdb( 'test_key' );

            should.throws( function() {
                return tv.SearchSeries();
            }, /not logged in/ );

        });

        it( 'should throw am error if no argument is provided', function( done ) {

            var tv = new tvdb( 'test_key' );

            tv.login()
                .then( function() {

                    should.throws( function() {
                        return tv.SearchSeries();
                    }, /no options/ );
                    should.throws( function() {
                        return tv.SearchSeries( {} );
                    }, /no options/ );

                    done();

                })
                .catch( function( err ) {

                    done( err );

                });

        });

        it( 'should throw an error if too many options are provided', function( done ) {

            var tv = new tvdb( 'test_key' );

            tv.login()
                .then( function() {

                    should.throws( function() {
                        return tv.SearchSeries( {
                            imdb_id: 'tt1234567',
                            zap2it_id: '123'
                        });
                    }, /only one/ );

                    should.throws( function() {
                        return tv.SearchSeries( {
                            imdb_id: 'tt1234567',
                            name: 'series name'
                        });
                    }, /only one/ );

                    should.throws( function() {
                        return tv.SearchSeries( {
                            zap2it_id: '123',
                            name: 'series name'
                        });
                    }, /only one/ );

                    should.throws( function() {
                        return tv.SearchSeries( {
                            imdb_id: 'tt1234567',
                            zap2it_id: '123',
                            name: 'series name'
                        });
                    }, /only one/ );

                    done();

                })
                .catch( function( err ) {

                    done( err );

                });

        });

        it( 'should return a series', function( done ) {

            var tv = new tvdb( 'test_key' );

            tv.login()
                .then( function() {

                    return tv.SearchSeries( {
                        imdb_id: 'tt1234567'
                    });

                })
                .then( function( body ) {

                    should.deepEqual( body, {
                        "data": [
                            {
                                "aliases": [
                                    "test_alias"
                                ],
                                "banner": "graphical/test-banner.jpg",
                                "firstAired": "1234-01-02",
                                "id": 12345,
                                "network": "test_tv-station",
                                "overview": "test description",
                                "seriesName": "test_series",
                                "status": "Continuing"
                            }
                        ]
                    });

                    done();
                })
                .catch( function( err ) {

                    done( err );

                });

        });

    });

    describe( 'SeriesEpisodes', function() {

        var tvdb;

        before( function() {

            tvdb = proxyquire( __dirname + '/../../../app/modules/tvdb', {
                request: function( options, callback ) {

                    if ( options.uri == '/login' ) {

                        callback( null, null, {
                            token: 'test-token'
                        });

                    }
                    else {

                        callback( null, null, '{' +
                        '"errors": null,' +
                        '   "links": {' +
                        '       "first": 1,' +
                        '       "last": 1,' +
                        '       "next": null,' +
                        '       "prev": null' +
                        '   },' +
                        '   "data": [' +
                        '       {' +
                        '           "absoluteNumber": null,' +
                        '           "airedEpisodeNumber": 1,' +
                        '           "airedSeason": "1",' +
                        '           "dvdEpisodeNumber": null,' +
                        '           "dvdSeason": null,' +
                        '           "episodeName": "Episode 1",' +
                        '           "firstAired": "2007-07-07",' +
                        '           "id": 12345,' +
                        '           "language": {' +
                        '               "episodeName": "en",' +
                        '               "overview": "en"' +
                        '           },' +
                        '           "overview": "Episode 1 description"' +
                        '       },' +
                        '       {' +
                        '           "absoluteNumber": null,' +
                        '           "airedEpisodeNumber": 2,' +
                        '           "airedSeason": "1",' +
                        '           "dvdEpisodeNumber": null,' +
                        '           "dvdSeason": null,' +
                        '           "episodeName": "The Getaway",' +
                        '           "firstAired": "2007-07-14",' +
                        '           "id": 12346,' +
                        '           "language": {' +
                        '               "episodeName": "en",' +
                        '               "overview": "en"' +
                        '           },' +
                        '           "overview": "Episode 2 description"' +
                        '       }' +
                        '   ]' +
                        '}');

                    }
                }
            })

        });

        it( 'should throw am error if no token is present', function() {

            var tv = new tvdb( 'test_key' );

            should.throws( function() {
                return tv.SeriesEpisodes( 1 );
            }, /not logged in/ );

        });

        it( 'should throw am error if no argument is provided', function( done ) {

            var tv = new tvdb( 'test_key' );

            tv.login()
                .then( function() {

                    should.throws( function() {
                        return tv.SeriesEpisodes();
                    }, /series_id has to be a number/ );
                    should.throws( function() {
                        return tv.SeriesEpisodes( null );
                    }, /series_id has to be a number/ );

                    done();

                })
                .catch( function( err ) {

                    done( err );

                });

        });

        it( 'should return a list of episodes', function( done ) {

            var tv = new tvdb( 'test_key' );

            tv.login()
                .then( function() {

                    return tv.SeriesEpisodes( 1234 );

                })
                .then( function( body ) {

                    should.deepEqual( body, {
                        "errors": null,
                        "links": {
                            "first": 1,
                            "last": 1,
                            "next": null,
                            "prev": null
                        },
                        "data": [
                            {
                                "absoluteNumber": null,
                                "airedEpisodeNumber": 1,
                                "airedSeason": "1",
                                "dvdEpisodeNumber": null,
                                "dvdSeason": null,
                                "episodeName": "Episode 1",
                                "firstAired": "2007-07-07",
                                "id": 12345,
                                "language": {
                                    "episodeName": "en",
                                    "overview": "en"
                                },
                                "overview": "Episode 1 description"
                            },
                            {
                                "absoluteNumber": null,
                                "airedEpisodeNumber": 2,
                                "airedSeason": "1",
                                "dvdEpisodeNumber": null,
                                "dvdSeason": null,
                                "episodeName": "The Getaway",
                                "firstAired": "2007-07-14",
                                "id": 12346,
                                "language": {
                                    "episodeName": "en",
                                    "overview": "en"
                                },
                                "overview": "Episode 2 description"
                            }
                        ]
                    });

                    done();
                })
                .catch( function( err ) {

                    done( err );

                });

        });

    });

    describe( 'Series', function() {

        var tvdb;

        before( function() {

            tvdb = proxyquire( __dirname + '/../../../app/modules/tvdb', {
                request: function( options, callback ) {

                    if ( options.uri == '/login' ) {

                        callback( null, null, {
                            token: 'test-token'
                        });

                    }
                    else {

                        callback( null, null, '{' +
                        '"data": {' +
                        '       "id": 12345,' +
                        '       "seriesName": "Test Series",' +
                        '       "aliases": [' +
                        '           "Test Series Alias"' +
                        '       ],' +
                        '       "banner": "graphical/test.jpg",' +
                        '       "seriesId": "23456",' +
                        '       "status": "Continuing",' +
                        '       "firstAired": "1337-01-01",' +
                        '       "network": "Network",' +
                        '       "networkId": "",' +
                        '       "runtime": "60",' +
                        '       "genre": [' +
                        '           "Comedy",' +
                        '           "Crime",' +
                        '           "Drama"' +
                        '       ],' +
                        '       "overview": "Series Overview",' +
                        '       "lastUpdated": 1442605202,' +
                        '       "airsDayOfWeek": "Monday",' +
                        '       "airsTime": "10:00 PM",' +
                        '       "rating": "TV-PG",' +
                        '       "imdbId": "tt12345",' +
                        '       "zap2itId": "EP123456",' +
                        '       "added": "2007-07-07 07:07:07",' +
                        '       "addedBy": 1337' +
                        '   }' +
                        '}');

                    }
                }
            })

        });

        it( 'should throw am error if no token is present', function() {

            var tv = new tvdb( 'test_key' );

            should.throws( function() {
                return tv.SeriesEpisodes( 1 );
            }, /not logged in/ );

        });

        it( 'should throw am error if no argument is provided', function( done ) {

            var tv = new tvdb( 'test_key' );

            tv.login()
                .then( function() {

                    should.throws( function() {
                        return tv.SeriesEpisodes();
                    }, /series_id has to be a number/ );
                    should.throws( function() {
                        return tv.SeriesEpisodes( null );
                    }, /series_id has to be a number/ );

                    done();

                })
                .catch( function( err ) {

                    done( err );

                });

        });

        it( 'should return series info', function( done ) {

            var tv = new tvdb( 'test_key' );

            tv.login()
                .then( function() {

                    return tv.SeriesEpisodes( 1234 );

                })
                .then( function( body ) {

                    should.deepEqual( body, {
                        "data": {
                            "id": 12345,
                            "seriesName": "Test Series",
                            "aliases": [
                                "Test Series Alias"
                            ],
                            "banner": "graphical/test.jpg",
                            "seriesId": "23456",
                            "status": "Continuing",
                            "firstAired": "1337-01-01",
                            "network": "Network",
                            "networkId": "",
                            "runtime": "60",
                            "genre": [
                                "Comedy",
                                "Crime",
                                "Drama"
                            ],
                            "overview": "Series Overview",
                            "lastUpdated": 1442605202,
                            "airsDayOfWeek": "Monday",
                            "airsTime": "10:00 PM",
                            "rating": "TV-PG",
                            "imdbId": "tt12345",
                            "zap2itId": "EP123456",
                            "added": "2007-07-07 07:07:07",
                            "addedBy": 1337
                        }
                    });

                    done();
                })
                .catch( function( err ) {

                    done( err );

                });

        });

    });

    describe( 'UpdatedQuery', function() {

        var tvdb;

        before( function() {

            tvdb = proxyquire( __dirname + '/../../../app/modules/tvdb', {
                request: function( options, callback ) {

                    if ( options.uri == '/login' ) {

                        callback( null, null, {
                            token: 'test-token'
                        });

                    }
                    else {

                        callback( null, null, '{ ' +
                        '"data": [' +
                        '       {' +
                        '           "id": 123456,' +
                        '           "lastUpdated": 1442534926' +
                        '       },' +
                        '       {' +
                        '           "id": 123457,' +
                        '           "lastUpdated": 1442535937' +
                        '       },' +
                        '       {' +
                        '           "id": 12345,' +
                        '           "lastUpdated": 1442536169' +
                        '       }' +
                        '   ],' +
                        '   "errors": null' +
                        '}');

                    }
                }
            })

        });

        it( 'should throw am error if no token is present', function() {

            var tv = new tvdb( 'test_key' );

            should.throws( function() {
                return tv.SeriesEpisodes( 1 );
            }, /not logged in/ );

        });

        it( 'should return a list of updated series if no argument is provided', function( done ) {

            var tv = new tvdb( 'test_key' );

            tv.login()
                .then( function() {

                    return tv.UpdatedQuery( );

                })
                .then( function( body ) {

                    should.deepEqual( body, {
                        "data": [
                            {
                                "id": 123456,
                                "lastUpdated": 1442534926
                            },
                            {
                                "id": 123457,
                                "lastUpdated": 1442535937
                            },
                            {
                                "id": 12345,
                                "lastUpdated": 1442536169
                            }
                        ],
                        "errors": null
                    });

                    done();
                })
                .catch( function( err ) {

                    done( err );

                });

        });

        it( 'should return a list of updated series if a date is provided', function( done ) {

            var tv = new tvdb( 'test_key' );

            tv.login()
                .then( function() {

                    var now = new Date();

                    return tv.UpdatedQuery( now );

                })
                .then( function( body ) {

                    should.deepEqual( body, {
                        "data": [
                            {
                                "id": 123456,
                                "lastUpdated": 1442534926
                            },
                            {
                                "id": 123457,
                                "lastUpdated": 1442535937
                            },
                            {
                                "id": 12345,
                                "lastUpdated": 1442536169
                            }
                        ],
                        "errors": null
                    });

                    done();
                })
                .catch( function( err ) {

                    done( err );

                });

        });

    });

});