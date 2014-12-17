module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngdocs: {
            all: ['resource/javascripts/**/**.js'],
            options: {
                scripts: ['static/javascripts/libs/angular-1.3.0/angular.js', 'static/javascripts/libs/angular-1.3.0/angular-animate.js'],
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
                compress: false,
                beautify: true,
                mangle: false,
                preserveComments: false
            },
            my_target: {
                files: {
                    'static/javascripts/krusha.min.js': [
                        'resource/javascripts/polyfills.js',
                        'resource/javascripts/scrollfix.js',
                        'resource/javascripts/recaptcha.js',
                        'resource/javascripts/krusha.js',
                        'resource/javascripts/filter.js',
                        'resource/javascripts/validators.js',
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