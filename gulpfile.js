var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync');

gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: './app',
        browser: 'Google Chrome'
    });

    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch(['app/scss/base/_customVariables.scss', 'app/scss/bootstrap/**/*.scss'], ['bootstrap']);
    gulp.watch('app/scripts/**/*.js').on('change', browserSync.reload);
    gulp.watch('app/**/*.html').on('change', browserSync.reload);
});

gulp.task('sass', function() {
    gulp.src('./app/scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./app/styles'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('bootstrap', function() {
    gulp.src('./app/scss/bootstrap.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./app/styles'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('default', ['serve', 'bootstrap', 'sass']);
