module.exports = function(grunt) {

    'use strict';

    // displays the elapsed execution time of grunt tasks
    require('time-grunt')(grunt);

    // reads package.json file, and looks for any plugins in the dependencies
    //and devDependencies list that start with 'grunt-' and loads them automatically
    require('load-grunt-tasks')(grunt);


    // Project configuration wrapper.
    grunt.initConfig({

        // config the roots so that not to repeat yourself
        appConfig: {
            public: 'public',
            dist: 'dist',
            build: 'build'
        },

        pkg: grunt.file.readJSON('package.json'),

        // reads the bower.json file and installs any front-end dependencies on first launch
        bower: {
            install: {
                options: {
                    targetDir: '<%= appConfig.public %>/js/lib',
                    layout: 'byType',
                    verbose: false, // provides debug output
                    bowerOptions: {
                        forceLatest: true, // Force latest version on conflict
                        production: false // Do not install project devDependencies on production
                    }
                }
            }
        },

        // compiles all front-end js files into a single file with grunt-contrib-requirejs
        // which turns out to be a much better alternative to simple minification
        // in terms of efficiency and speed
        requirejs: {
            compile: {
                options: {
                    baseUrl: './<%= appConfig.public %>/js/lib',
                    mainConfigFile: './<%= appConfig.public %>/js/main.js',
                    // almond wrapper to support single-file build output
                    name: '../../../node_modules/almond/almond',
                    include: ['../main'],
                    out: "dist/req/<%= pkg.name %>.js",
                    findNestedDependencies: true,
                    optimize: 'uglify',
                    compress: true
                    //fileExclusionRegExp: /^\./,
                    //locale: "ru",
                    //wrap: true,
                    //useStrict: false,
                    //generateSourceMaps: true,
                    //wrapShim: true
                }
            }

        },

        // minifies images using grunt-contrib-imagemin
        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: '<%= appConfig.public %>/assets',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: '<%= appConfig.dist %>/assets'
                }]
            }
        },

        // minifies html templates using grunt-htmlclean
        htmlclean: {
            deploy: {
                expand: true,
                cwd: '<%= appConfig.public %>/templates',
                src: '**/*.html',
                dest: '<%= appConfig.dist %>/templates'
            }
        },

        // cleans <%= appConfig.build %>, <%= appConfig.dist %> folders before each build
        clean: {
            all: ['<%= appConfig.build %>', '<%= appConfig.dist %>'],
            req: ['<%= appConfig.dist %>/req']
        },

        // transpiles less files
        less: {
            transpile: {
                files: {
                    '<%= appConfig.build %>/<%= pkg.name %>.css': [
                        '<%= appConfig.public %>/**/main.css',
                        '<%= appConfig.public %>/**/adaptive.css'
                    ]
                }
            }
        },

        // copies rest of the files from the <%= appConfig.public %> directory to the destination that they must reside
        // so that our front-end app can see them and our server can serve them
        copy: {
            all: {
                files: [{
                    expand: true,
                    cwd: '<%= appConfig.public %>/assets',
                    dest: '<%= appConfig.dist %>/assets',
                    src: [
                        '**', '!*.{png,jpg,gif}'
                    ],
                    filter: 'isFile'
                }]
            }
        },

        // compresses the transpiled single css file and copies it to dist folder
        cssmin: {
            minify: {
                src: ['<%= appConfig.build %>/<%= pkg.name %>.css'],
                dest: '<%= appConfig.dist %>/css/<%= pkg.name %>.css'
            }
        },

        // compresses all the frontend js files
        uglify: {
            compile: {
                options: {
                    mangle: true,
                    sourceMap: false,
                    drop_console: true,
                    compress: true,
                    verbose: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= appConfig.public %>/js',
                    src: ['**/*.js'],
                    dest: '<%= appConfig.dist %>/js'
                }]
            }
        },

        // watch all frontend files for any time they get modified
        watch: {
            scripts: {
                files: [
                    'Gruntfile.js',
                    '<%= appConfig.public %>/templates/*.html',
                    '<%= appConfig.public %>/js/**/*.js'
                ],
                tasks: [
                    'build'
                ]
            },
            req: {
                files: [
                    'Gruntfile.js',
                    '<%= appConfig.public %>/templates/*.html',
                    '<%= appConfig.public %>/js/**/*.js'
                ],
                tasks: [
                    'req'
                ]
            }
        },

        // restarts the server whenever a file in the listed folders get changed
        nodemon: {
            dev: {
                options: {
                    file: './server.js',
                    nodeArgs: ['--debug'],
                    watchedFolders: ['**'],
                    env: {
                        PORT: '3000'
                    }
                }
            }
        },

        // command line execution to start the mongod server
        shell: {
            mongo: {
                command: 'mongod',
                options: {
                    async: true
                }
            }
        },

        // executes a number of tasks asynchronously at the same time
        concurrent: {
            dev: {
                tasks: ['nodemon:dev', 'watch:scripts'],
                options: {
                    logConcurrentOutput: true
                }
            },
            req: {
                tasks: ['nodemon:dev', 'watch:req'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        // runs jsHint syntax checking on all necessary .js files
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporterOutput: 'jshint.log'
            },
            all: ['Gruntfile.js', '<%= appConfig.public %>/js/**/*.js'],
        }

    });


    // sets up command line commands to execute all above stuff
    // by doing $ grunt mytask

    // makes a copy of the project where all files are only minified
    grunt.registerTask('build', [
        'clean:all',
        //'jshint:all',
        'less:transpile',
        'cssmin',
        'uglify',
        'copy:all',
        'imagemin',
        'htmlclean',
        'concurrent:dev'
    ]);

    // Minifies and compiles all files into one single file using almond.js.
    // Check out the increased efficiency in comparison to the previous alternative.
    grunt.registerTask('req', [
        'clean:req',
        //'jshint:all',
        'less:transpile',
        'cssmin',
        'copy:all',
        'imagemin',
        'requirejs',
        'concurrent:req'
    ]);

    // Default task(s).
    grunt.registerTask('default', ['req']);

};