const jasmineIstanbulTemplate = require('grunt-template-jasmine-istanbul');
const jasmineRequireTemplate = require('grunt-template-jasmine-requirejs');

const buildDirectory = 'bin/';
const coverageRunner = 'coverage-runner.html';
const documentationBase = 'doc';
const gitHubPagesMessage = 'Update documentation';
const gitHubPagesSource = '**/*';
const jasmineSpecRunner = 'spec-runner.html';
const requireConfigFile = 'test/require-config.js';
const serverPort = 8000;
const sourcePath = 'src/**/*.js';
const specPath = 'test/spec/**/*.js';
const docFiles = [sourcePath, 'README.md'];

const requireCallback = function() {
    define('instrumented', ['module'], function(module) {
        return module.config().src;
    });

    require(['instrumented'], function(instrumented) {
        var oldLoad = requirejs.load;

        requirejs.load = function(context, moduleName, url) {
            if(url.substring(0, 1) === '/') {
                url = url.substring(1);
            } else if(url.substring(0, 2) === './') {
                url = url.substring(2);
            }

            if(instrumented.indexOf(url) > -1) {
                url = './.grunt/grunt-contrib-jasmine/' + url;
            }

            return oldLoad.apply(this, [context, moduleName, url]);
        };
    });
};

module.exports = function(grunt) {
    grunt.initConfig({
        clean: [
            '.grunt',
            buildDirectory,
            coverageRunner,
            documentationBase,
            jasmineSpecRunner
        ],
        connect: {
            server: {
                options: {
                    port: serverPort,
                    useAvailablePort: true
                }
            }
        },
        jasmine: {
            options: {
                specs: specPath,
                keepRunner: true
            },
            coverage: {
                src: sourcePath,
                options: {
                    display: 'short',
                    outfile: coverageRunner,
                    template: jasmineIstanbulTemplate,
                    templateOptions: {
                        coverage: buildDirectory + 'coverage/coverage.json',
                        replace: false,
                        template: jasmineRequireTemplate,
                        report: [{
                            type: 'text-summary'
                        }, {
                            type: 'cobertura',
                            options: {
                                dir: buildDirectory + 'coverage/cobertura'
                            }
                        }],
                        templateOptions: {
                            requireConfigFile: requireConfigFile,
                            requireConfig: {
                                callback: requireCallback,
                                config: {
                                    instrumented: {
                                        src: grunt.file.expand(sourcePath)
                                    }
                                }
                            }
                        }
                    }
                }
            },
            test: {
                src: sourcePath,
                options: {
                    outfile: jasmineSpecRunner,
                    template: jasmineRequireTemplate,
                    junit: {
                        path: buildDirectory + 'test'
                    },
                    templateOptions: {
                        requireConfigFile: requireConfigFile
                    }
                }
            }
        },
        jshint: {
            all: [sourcePath, specPath],
            options: {
                asi: true,
                bitwise: true,
                browser: true,
                camelcase: true,
                curly: true,
                devel: true,
                eqeqeq: true,
                es3: true,
                expr: true,
                forin: true,
                freeze: true,
                jquery: true,
                latedef: true,
                laxbreak: true,
                newcap: true,
                noarg: true,
                noempty: true,
                nonbsp: true,
                undef: true,
                unused: true,
                globals: {
                    define: false,
                    expect: false,
                    it: false,
                    require: false,
                    describe: false,
                    beforeEach: false,
                    afterEach: false,
                    jasmine: false,
                    xit: false,
                    xdescribe: false
                }
            }
        },
        jsdoc: {
            dist: {
                src: docFiles,
                options: {
                    destination: documentationBase,
                    template: 'node_modules/ink-docstrap/template',
                    configure: 'jsdoc.conf.json'
                }
            }
        },
        'gh-pages': {
            'default': {
                src: gitHubPagesSource,
                options: {
                    base: documentationBase,
                    message: gitHubPagesMessage
                }
            }
        },
        watch: {
            buildTest: {
                files: [sourcePath, 'test/**/*.js'],
                tasks: ['jasmine:test:build']
            },
            doc: {
                files: docFiles,
                tasks: ['doc']
            },
            test: {
                files: [sourcePath, 'test/**/*.js'],
                tasks: ['jasmine:test']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('coverage', ['jasmine:coverage']);
    grunt.registerTask('doc', ['jsdoc']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['jasmine:test']);

    grunt.registerTask('server', ['connect:server:keepalive']);
    grunt.registerTask('watch-doc', ['doc', 'watch:doc']);
    grunt.registerTask('watch-test', ['jasmine:test', 'watch:test']);
    grunt.registerTask('watch-build-test', ['jasmine:test:build', 'watch:buildTest']);

    grunt.registerTask('ci', ['lint', 'test', 'coverage']);
    grunt.registerTask('push-doc', ['doc', 'gh-pages:default']);
};
