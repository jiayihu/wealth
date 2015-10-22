var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    fileInclude = require('gulp-file-include'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync');

gulp.task('html-partials', function() {
  gulp.src(['./app/html/index.html'])
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
      .on('error', console.log)
    .pipe(gulp.dest('./app/'))
    .pipe(browserSync.stream());
});

gulp.task('js-partials', function() {
  gulp.src('./app/scripts/development/main.js')
    .pipe(fileInclude({
      prefix: '//@@'
    }))
      .on('error', console.log)
    .pipe(gulp.dest('./app/scripts/'))
    .pipe(browserSync.stream());
});

gulp.task('sass', function() {
    gulp.src('./app/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./app/styles'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('bootstrap', function() {
    gulp.src('./app/scss/bootstrap.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./app/styles'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: './app',
        browser: 'Google Chrome'
    });

    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch(['app/scss/base/_customVariables.scss', 'app/scss/bootstrap/**/*.scss'], ['bootstrap']);
    gulp.watch('app/scripts/**/*.js', ['js-partials']);
    gulp.watch('app/html/**/*.html', ['html-partials']);
});

gulp.task('default', ['serve', 'html-partials', 'bootstrap', 'sass', 'js-partials']);
