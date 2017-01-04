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
var browserSync = require('browser-sync').create();

// var lib = require('bower-files')();
var lib = require('bower-files')({
  "overrides":{
    "bootstrap" : {
      "main": [
        "less/bootstrap.less",
        "dist/css/bootstrap.css",
        "dist/js/bootstrap.js"
      ]
    }
  }
});

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

gulp.task('build', ['clean'], function(){
  if (buildProduction) {
    gulp.start('minifyScripts');
  } else {
    gulp.start('jsBrowserify');
  }
  gulp.start('bower');
});

// Since we will always want to include our vendor files whether or not we are making a production build, we will just call the bower task using gulp.start at the end of our build task.

gulp.task("clean", function() {
  return del(['build', 'tmp']);
});

gulp.task('jshint', function() {
  return gulp.src(['js/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('bowerJS', function() {
  return gulp.src(lib.ext('js').files)
  //targeting all js files
    .pipe(concat('vendor.min.js'))
    //concatenating them together
    .pipe(uglify())
    //minifiying further
    .pipe(gulp.dest('./build/js'));
    //new destination folder!
});

gulp.task('bowerCSS', function () {
  return gulp.src(lib.ext('css').files)
  .pipe(concat("vendor.css"))
  .pipe(gulp.dest('./build/css'));
});

gulp.task('bower', ['bowerJS', 'bowerCSS']);
// This task has no callback function, but it has 2 dependency tasks: bowerJS and bowerCSS. Incidentally, it is important to note that the order of the tasks in the dependency array is ignored by gulp. So we can't use this method if we need one task to be completed before the next one in the array begins. Our bower task above will run both the bowerJS and bowerCSS tasks concurrently. This is nice because it is faster than running them one after the other! But if we need to run task1 before task2, then we must specify task1 as a dependency of task2, not just list them in order as part of a third master task.

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: "./",
      index: "index.html"
    }
  });

  gulp.watch(['js/*.js'], ['jsBuild']);
  gulp.watch(['bower.json'], ['bowerBuild']);
  gulp.watch(['*.html'], ['htmlBuild']);
});

gulp.task('jsBuild', ['jsBrowserify', 'jshint'], function(){
  browserSync.reload();
});

gulp.task('bowerBuild', ['bower'], function(){
  browserSync.reload();
});

gulp.task('htmlBuild', function() {
  browserSync.reload();
});

// We can keep adding as many watchers and build tasks as we need using this format. Just remember that any time you change a gulp task, you must restart the server.
