var gulp = require('gulp');
var browserSync = require('browser-sync');
var plumber = require('gulp-plumber');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var please = require('gulp-pleeease');
var browserify = require('gulp-browserify');
var notify = require('gulp-notify');

var options = {
  plumber: {
    errorHandler: notify.onError({
      message: 'Error: <%= error.message %>',
      sound: false,
      wait: true
    })
  }
};

// markups
gulp.task('markups', function() {
  'use strict';
  return gulp.src('dev/**/*.jade')
    .pipe(plumber(options.plumber))
    .pipe(jade())
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({stream: true}));
});

// styles
gulp.task('styles', function() {
  'use strict';
  return gulp.src('dev/**/*.sass')
    .pipe(plumber(options.plumber))
    .pipe(sass({
      indentedSyntax: true,
      errLogToConsole: true,
      sourceComments : 'normal'
    }))
    .pipe(please({
      'minifier': false,
      'autoprefixer': {
        'browsers': ['last 4 version', 'ie 8', 'iOS 4', 'Android 2.3']
      }
    }))
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({stream: true}));
});

// scripts
gulp.task('scripts', function() {
  'use strict';
  return gulp.src(['dev/app.js'])
    .pipe(plumber(options.plumber))
    .pipe(browserify({
      transform: ['babelify'],
      debug: true
    }))
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({stream: true}));
});

// files
gulp.task('files', function() {
  'use strict';
  return gulp.src(['dev/**/*.+(png|jpg|gif)'])
    .pipe(plumber(options.plumber))
    .pipe(gulp.dest('public/'));
});

// other
gulp.task('browserSync', ['markups', 'styles', 'scripts', 'files'], function() {
  'use strict';
  return browserSync.init(null, {
    server: {
      baseDir: 'public/'
    },
    notify: false
  });
});

gulp.task('watch', function() {
  'use strict';
  gulp.watch(['dev/**/*.sass'], ['styles']);
  gulp.watch(['dev/**/*.jade'], ['markups']);
  gulp.watch(['dev/**/*.js'], ['scripts']);
  gulp.watch(['dev/**/*.+(png|jpg|gif)'], ['files']);
});

gulp.task('default', ['watch', 'browserSync']);
