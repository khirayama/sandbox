'use strict';
var gulp = require('gulp');
var browserSync = require('browser-sync');
var plumber = require('gulp-plumber');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var please = require('gulp-pleeease');
var browserify = require('gulp-browserify');
var notify = require('gulp-notify');
var mocha = require('gulp-spawn-mocha');

var options = {
  plumber: {
    errorHandler: notify.onError({
      message: 'Error: <%= error.message %>',
      sound: false,
      wait: true
    })
  }
};

gulp.task('markups', function() {
  return gulp.src('dev/**/*.jade')
    .pipe(plumber(options.plumber))
    .pipe(jade())
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('styles', function() {
  return gulp.src('dev/**/*.scss')
    .pipe(plumber(options.plumber))
    .pipe(sass({
      // indentedSyntax: true,
      errLogToConsole: true,
      sourceComments : 'normal'
    }))
    .pipe(please({
      'minifier': false,
      'autoprefixer': {'browsers': ['last 4 version', 'ie 8', 'iOS 4', 'Android 2.3']}
    }))
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function() {
  return gulp.src(['dev/app.js'])
    .pipe(plumber(options.plumber))
    .pipe(browserify({
      transform: ['babelify'],
      debug: true
    }))
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('files', function() {
  return gulp.src(['dev/**/*.+(png|jpg|gif)'])
    .pipe(plumber(options.plumber))
    .pipe(gulp.dest('public/'));
});

gulp.task('test', function() {
  return gulp.src(['dev/**/*.test.js'])
    .pipe(mocha({
	    compilers: 'js:babel/register'
    }));
});

gulp.task('browserSync', ['markups', 'styles', 'scripts', 'files'], function() {
  return browserSync.init(null, {
    server: {baseDir: 'public/'},
    notify: false
  });
});

gulp.task('watch', function() {
  gulp.watch(['dev/**/*.scss'], ['styles']);
  gulp.watch(['dev/**/*.jade'], ['markups']);
  gulp.watch(['dev/**/*.js', '!dev/**/*.test.js'], ['scripts']);
  gulp.watch(['dev/**/*.test.js'], ['test']);
  gulp.watch(['dev/**/*.+(png|jpg|gif)'], ['files']);
});

gulp.task('develop', ['watch', 'browserSync']);
