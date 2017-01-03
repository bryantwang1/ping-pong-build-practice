//here are all the modules we are using
//the tasks link all the modules together

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var utilities = require('gulp-util');
var del = require('del');
var jshint = require('gulp-jshint');

var buildProduction = utilities.env.production;

gulp.task('concatInterface', function() {
  // return gulp.src(['./js/pingpong-interface.js', './js/signup-interface.js'])
  return gulp.src(['./js/*-interface.js'])
  .pipe(concat('allConcat.js'))
  .pipe(gulp.dest('./tmp'));
});

gulp.task('jsBrowserify', ['concatInterface'], function(){

  // jsBrowderify is dependent on concatInterface.
  // concatInterface MUST RUN BEFORE jsBrowserify in order to work.
  // the position is defines what is dependent on what
  // the brackets on [concatInterface] are just because it is an array,
  // it has nothing to do with dependency.
  return browserify({ entries: ['./tmp/allConcat.js']})
    .bundle()
    // built into browserify package (don't worry what it does)
    .pipe(source('app.js'))
    // create a new file called app.js
    .pipe(gulp.dest('./build/js'));
    //this creates a new folder within a folder where the file will go.
});

gulp.task("minifyScripts", ["jsBrowserify"], function(){
  return gulp.src(["./build/js/app.js"])
    .pipe(uglify())
    .pipe(gulp.dest("./build/js"));
});

gulp.task("build", ['clean'], function() {
  if (buildProduction) {
    gulp.start('minifyScripts');
  } else {
    gulp.start('jsBrowserify');
  }
});

gulp.task("clean", function() {
  return del(['build', 'tmp']);
});

gulp.task('jshint', function() {
  return gulp.src(['js/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// running gulp jsBrowserify will tell the gulp task to run, which is
// dependent on the concatInterface task running, so essentially they
// both run.
