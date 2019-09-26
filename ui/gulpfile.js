var gulp = require('gulp');

var ui5preload = require('gulp-ui5-preload');
var uglify = require('gulp-uglify');
var prettydata = require('gulp-pretty-data');
var gulpif = require('gulp-if');

gulp.task(
		'ui5preload',
		function() {
			return gulp.src(
					[
						'**/**.+(js|xml)',
						'!**/Component-preload.js',
						'!gulpfile.js',
						'!underscore-min.js'
						]
			)
			.pipe(gulpif('**/*.js', uglify()))
			.pipe(gulpif('**/*.xml', prettydata({type: 'minify'})))
			.pipe(ui5preload({
				base: './',
				namespace: 'sapui5in.appbuilder',
				fileName: 'Component-preload.js'
			}))
			.pipe(gulp.dest('./'));
		}
)