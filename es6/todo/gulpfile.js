var gulp = require('gulp');
var del = require('del');
var browserSync = require('browser-sync');
var plumber = require('gulp-plumber');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var please = require('gulp-pleeease');
var browserify = require('gulp-browserify');

// dev //////////////////////////////////////////////////////////////////////////////////////
// markups /////////////////////////////////////////////////////////////////////////////////////
gulp.task('markups', function() {
  return gulp.src('dev/**/*.jade')
    .pipe(plumber())
    .pipe(jade())
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({stream: true}));
});

// styles //////////////////////////////////////////////////////////////////////////////////////
gulp.task('styles', function() {
  return gulp.src('dev/**/*.sass')
    .pipe(plumber())
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

// js ///////////////////////////////////////////////////////////////////////////////////////
gulp.task('scripts', function() {
  return gulp.src(['dev/app.js'])
    .pipe(plumber())
    .pipe(browserify({
      transform: ['babelify']
    }))
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({stream: true}));
});

// files ///////////////////////////////////////////////////////////////////////////////////////
gulp.task('files', function() {
  return gulp.src(['dev/**/*.+(png|jpg|gif)'])
    .pipe(plumber())
    .pipe(gulp.dest('public/'));
});

// other ///////////////////////////////////////////////////////////////////////////////////////
gulp.task('browserSync', ['markups', 'styles', 'scripts', 'files'], function() {
  return browserSync.init(null, {
    server: {
      baseDir: 'public/'
    },
    notify: false
  });
});

gulp.task('watch', function() {
  gulp.watch(['dev/**/*.sass'], ['styles']);
  gulp.watch(['dev/**/*.html'], ['markups']);
  gulp.watch(['dev/**/*.js'], ['scripts']);
  gulp.watch(['dev/**/*.+(png|jpg|gif)'], ['files']);
});

gulp.task('default', ['watch', 'browserSync']);
