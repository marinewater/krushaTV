var Promise = require( 'bluebird' );
var request = require( 'request' );
Promise.promisifyAll( request );
var moment = require( 'moment' );

/**
 * Inializes a new instance of the TVDb class and sets options
 * TVDb documentation can be found at https://api-beta.thetvdb.com/swagger
 * @param {string} api_key TVDb api key
 * @param {string} username TVDb username
 * @param {string} password TVDb password
 * @param {object} [options] change the default options
 * @param {string} [options.base_url=https://api-beta.thetvdb.com/] the api base url, used for all requests
 * @param {string} [options.language=null] the language for response data; all available languages can be found at
 *     /languages
 * @constructor
 */
function TVDb ( api_key, username, password, options ) {

    if ( typeof api_key !== 'string' ) {
        throw new Error( 'api_key is required' );
    }

    if ( typeof api_key !== 'string' ) {
        throw new Error( 'username is required' );
    }

    if ( typeof api_key !== 'string' ) {
        throw new Error( 'password is required' );
    }

    this.api_key = api_key;
    this.username = username;
    this.password = password;
    this.token = null;
    this.options = defaultOptions( options );


    // private functions
    function defaultOptions( options ) {

        if ( typeof options !== 'object' ) {
            options = {};
        }

        options.base_url = options.hasOwnProperty( 'base_url' ) ? options.base_url : 'https://api-beta.thetvdb.com/';
        options.language = options.hasOwnProperty( 'language' ) ? options.language : null;

        return options;

    }

}

/**
 * login, has to be called before any subsequent requests
 * more info at https://api-beta.thetvdb.com/swagger#!/Authentication/post_login
 */
TVDb.prototype.login = function() {

    var _this = this;

    return request.postAsync( {
        baseUrl: _this.options.base_url,
        uri: '/login',
        json: true,
        body: {
            apikey: _this.api_key,
            username: _this.username,
            userpass: _this.password
        }
    })
        .then( function( response ) {

            _this.token = response.body.token;

        });

};


/**
 * makes a get request to the TVDb API
 * @param {string} uri the requested API resource (without the base url)
 * @param [qs] query string
 * @returns {bluebird}
 */
TVDb.prototype.getRequest = function( uri, qs ) {

    var _this = this;

    var http_headers = {};

    if ( _this.options.language ) {
        http_headers['Accept-Language'] = _this.options.language;
    }

    if ( typeof qs !== 'object' ) {
        qs = {};
    }

    return request.getAsync( {
        baseUrl: _this.options.base_url,
        uri: uri,
        qs: qs,
        headers: http_headers,
        auth: {
            bearer: _this.token
        }
    })
    .then( function( res ) {

        return JSON.parse( res.body );

    });

};

/**
 * search the api for a series
 * more info at https://api-beta.thetvdb.com/swagger#!/Search/get_search_series
 * @param {object} query_items object, containing exactly one of the following items
 * @param {string} [query_items.imdb_id] imdb series id
 * @param {string} [query_items.zap2it_id] zap2it series id
 * @param {string} [query_items.name] series name
 */
TVDb.prototype.SearchSeries = function( query_items ) {

    var _this = this;

    if ( !_this.token ) {
        throw new Error( 'not logged in' );
    }


    var count_options = 0;
    var qs = {};

    if ( typeof query_items === 'object' ) {
        if ( query_items.hasOwnProperty( 'imdb_id' ) ) {
            count_options++;
            qs.imdbId = query_items.imdb_id
        }

        if ( query_items.hasOwnProperty( 'zap2it_id' ) ) {
            count_options++;
            qs.zap2itId = query_items.zap2it_id
        }

        if ( query_items.hasOwnProperty( 'name' ) ) {
            count_options++;
            qs.name = query_items.name
        }
    }


    if ( count_options > 1 ) {
        throw new Error( 'too many options provided, only one allowed' );
    }
    else if ( count_options < 1 ) {
        throw new Error( 'no options provided' );
    }


    return _this.getRequest.call( _this, '/search/series', qs );

};

TVDb.prototype.Series = function( series_id ) {

    var _this = this;

    if ( !_this.token ) {
        throw new Error( 'not logged in' );
    }

    if ( typeof series_id !== 'number' ) {
        throw new Error( 'series_id has to be a number' );
    }

    var http_headers = {};

    if ( _this.options.language ) {
        http_headers['Accept-Language'] = _this.options.language;
    }

    return _this.getRequest.call( _this, '/series/' + series_id.toString() );

};

/**
 * get a list of episodes and info for each episode
 * more info at https://api-beta.thetvdb.com/swagger#!/Series/get_series_id_episodes
 * @param {number} series_id TVDb id of the series
 * @param {number} [page] Page of results to fetch. Defaults to page 1 if not provided.
 */
TVDb.prototype.SeriesEpisodes = function( series_id, page ) {

    var _this = this;

    if ( !_this.token ) {
        throw new Error( 'not logged in' );
    }

    if ( typeof series_id !== 'number' ) {
        throw new Error( 'series_id has to be a number' );
    }

    var qs = {};

    if ( typeof page === 'number' && page >= 1 ) {
        qs.page = page;
    }

    var http_headers = {};

    if ( _this.options.language ) {
        http_headers['Accept-Language'] = _this.options.language;
    }

    return _this.getRequest.call( _this, '/series/' + series_id.toString() + '/episodes', qs );

};

TVDb.prototype.UpdatedQuery = function( fromTime ) {

    var _this = this;

    if ( !_this.token ) {
        throw new Error( 'not logged in' );
    }

    var oneWeekAgo = moment().subtract( 7, 'days' );

    if ( !( fromTime instanceof Date ) || fromTime < oneWeekAgo ) {

        fromTime = oneWeekAgo;

    }
    else {

        fromTime = moment( fromTime );
    }

    qs = {
        fromTime: fromTime.unix()
    };

    var http_headers = {};

    if ( _this.options.language ) {
        http_headers['Accept-Language'] = _this.options.language;
    }


    return _this.getRequest.call( _this, '/updated/query', qs );

};

module.exports = TVDb;