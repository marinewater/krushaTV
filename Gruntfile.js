module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngdocs: {
            all: ['resource/javascripts/**/**.js'],
            options: {
                scripts: ['static/javascripts/bower_components/angular/angular.js', 'static/javascripts/bower_components/angular-animate/angular-animate.js'],
                html5Mode: false
            }
        },
        connect: {
            options: {
                keepalive: true
            },
            server: {}
        },
        clean: ['docs'],
        uglify: {
            options: {
                sourceMap: true,
                compress: true,
                beautify: false,
                mangle: true,
                preserveComments: false
            },
            my_target: {
                files: {
                    'static/javascripts/krusha.min.js': [
                        'static/javascripts/bower_components/angular-growl-notifications/dist/angular-growl-notifications.js',
                        'resource/javascripts/polyfills.js',
                        'resource/javascripts/scrollfix.js',
                        'resource/javascripts/recaptcha.js',
                        'resource/javascripts/krusha.js',
                        'resource/javascripts/filter.js',
                        'resource/javascripts/validators.js',
                        'resource/javascripts/animation.js',
                        'resource/javascripts/directives/*.js',
                        'resource/javascripts/factories/*.js',
                        'resource/javascripts/factories/api/*.js',
                        'resource/javascripts/controllers/*.js'
                    ]
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['uglify', 'clean', 'ngdocs', 'connect']);
    grunt.registerTask('uglifyit', ['uglify']);

};