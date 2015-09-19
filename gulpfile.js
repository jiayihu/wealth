var gulp = require('gulp'),
    changed = require('gulp-changed'),
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
    gulp.watch('app/scripts/**/*.js').on('change', browserSync.reload);
    gulp.watch('app/**/*.html').on('change', browserSync.reload);
});

gulp.task('sass', function() {
    gulp.src('./app/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./app/styles'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('default', ['serve']);
