// Karma configuration
// Generated on Sun Dec 28 2014 18:50:25 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'static/javascripts/bower_components/angular/angular.js',
      'static/javascripts/bower_components/angular-mocks/angular-mocks.js',
      'static/javascripts/bower_components/jquery/dist/jquery.js',
      'static/javascripts/bower_components/angular-animate/angular-animate.js',
      'static/javascripts/bower_components/angular-cookies/angular-cookies.js',
      'static/javascripts/bower_components/angular-route/angular-route.js',
      'static/javascripts/bower_components/angular-sanitize/angular-sanitize.js',
      'static/javascripts/bower_components/angular-touch/angular-touch.js',
      'static/javascripts/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'static/javascripts/bower_components/angular-growl-notifications/dist/angular-growl-notifications.js',
      'static/javascripts/bower_components/zeroclipboard/dist/ZeroClipboard.js',
      'static/javascripts/bower_components/ng-clip/dest/ng-clip.min.js',
      'static/javascripts/bower_components/angular-hotkeys/build/hotkeys.js',
      'static/javascripts/krusha.min.js',
      'test/angular/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
