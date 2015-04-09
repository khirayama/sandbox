gulp = require 'gulp'
# markups
jade = require 'gulp-jade'
# styles
sass = require 'gulp-sass'
please = require 'gulp-pleeease'
# scripts
webpack = require 'gulp-webpack'
# files
imagemin = require 'gulp-imagemin'
# utils
notify = require 'gulp-notify'
cached = require 'gulp-cached'
changed = require 'gulp-changed'
plumber = require 'gulp-plumber'
browserSync = require 'browser-sync'

options = {}
options.plumber = {
  errorHandler: notify.onError "Error: <%= error.message %>"
}

# dev ###########################################################################################
# markups #######################################################################################
gulp.task 'markups', ->
  gulp.src ["dev/**/*.jade"]
    .pipe(cached('markups'))
    .pipe(plumber options.plumber)
    .pipe(jade {
        pretty: true
      })
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({stream: true}))
# styles ########################################################################################
gulp.task 'styles', ->
  gulp.src ["dev/**/*.sass"]
    .pipe(cached('styles'))
    .pipe(plumber options.plumber)
    .pipe(sass {
      indentedSyntax: true
      errLogToConsole: true
      sourceComments : 'normal'
    })
    .pipe(please {
      minifier: false
      autoprefixer:
        browsers: ['last 4 version', 'ie 8', 'iOS 4', 'Android 2.3']
    })
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({stream: true}))
# scripts #######################################################################################
gulp.task 'scripts', ->
  gulp.src ["dev/scripts/app.js"]
    .pipe(cached('scripts'))
    .pipe(plumber options.plumber)
    .pipe(webpack({
      output:
        filename: 'bundle.js'
      module:
        loaders: [{
          test: /\.js$/
          loader: 'babel-loader'
        }]
      resolve:
        extensions: ['', '.js']
    }))
    .pipe(gulp.dest("public/"))
    .pipe(browserSync.reload({stream: true}))
# files #########################################################################################
gulp.task 'files', ->
  gulp.src ["dev/**/*.+(jpg|jpeg|png|gif|svg|html|css)"]
    .pipe(plumber options.plumber)
    .pipe(imagemin {
      optimizationLevel: 7
    })
    .pipe(gulp.dest("public/"))
    .pipe(browserSync.reload({stream: true}))
# utils #########################################################################################
gulp.task 'browserSync', ['watch'], ->
  browserSync {
    server:
      baseDir: 'public/'
    notify: false
  }

gulp.task 'watch', ['markups', 'styles', 'scripts', 'files'], ->
  gulp.watch ["dev/**/*.jade"], ['markups']
  gulp.watch ["dev/**/*.sass"], ['styles']
  gulp.watch ["dev/**/*.js"], ['scripts']
  gulp.watch ["dev/**/*.+(jpg|jpeg|png|gif|svg|js|html|css)"], ['files']

gulp.task 'default', ['browserSync']
