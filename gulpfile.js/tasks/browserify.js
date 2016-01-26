var config = require('../config.json');

var watchify = require('watchify');
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var path = require('path');
var assign = require('lodash.assign');
var browserSync  = require('browser-sync');

var paths = {
  src: path.join(config.root.src, config.tasks.scripts.src, config.tasks.scripts.main),
  dest: path.join(config.root.dest, config.tasks.scripts.dest)
};

var isProduction = config.env === 'production';
var customOpts = {
  entries: paths.src,
  debug: isProduction? false : true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

var bundle = function() {
  return b.bundle()
    .on('error', console.log)
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(gulpif(isProduction, uglify()))
    .on('error', console.log)
    .pipe(gulp.dest(paths.dest))
    .pipe(browserSync.stream());
};

b.on('update', bundle);

gulp.task('scripts', bundle);
