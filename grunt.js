module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:package.json>',
		watch: {
			coffee: {
				files: ['src/static/js/*.coffee','src/*.coffee', 'src/**/*.coffee'],
				tasks: 'coffee'
			},
			static: {
				files: ['src/static/**'],
				tasks: 'copy:stat'
			}
		},
		copy: {
			stat: {
				files: {
					//"path/to/directory/": "path/to/source/*", // includes files in dir
					"release/static/js/": "src/static/js/**/*.js", // includes files in dir and subdirs
					"release/static/": "src/static/*",
					"release/static/img/": "src/static/img/**",
					"release/static/css/": "src/static/css/*",
				}
			}
		},
		coffee: {
			compilefrontend: {
				files: {
					'release/static/js/*.js': ['src/static/js/*.coffee'],
					'release/*.js': ['src/*.coffee'] // compile individually into dest, maintaining folder structure
					}
				}
			}
		}
	);

	// Default task.
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.registerTask('default', 'coffee copy');
}