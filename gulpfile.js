'use strict';

var gulp = require('gulp');
var usemin = require('gulp-usemin');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var minifyCss = require('gulp-cssnano');
var minifyJs = require('gulp-uglify');
var minifyHTML = require('gulp-htmlmin');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var rtlcss = require('gulp-rtlcss');

var sourcemaps = require('gulp-sourcemaps');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');

var eslint = require('gulp-eslint');

var paths = {
  scripts: ['src/app/**/*.js', '!src/app/**/*.spec.js', '!./node_modules/**'],   // javaScripts files
  templates: 'src/app/**/*.html',                          // html files
  main: 'src/index.html',                                  // main files 
  styles: 'src/styles.scss',                               // styles
  images: 'src/assets/img/**/*.*',                         // images
  fonts: 'node_modules/{}/**/*.{ttf,woff,woff2,eof,svg}',  // fonts inside { } put your libs to included it only
};


var dest = {
  dest: 'dist',
  templates: 'dist/templates',                           // html files
  css: 'dist/css',                                           // css files
  scripts: 'dist/js',                                       // javaScripts files
  images: 'dist/assets/img',                             // images
  fonts: 'dist',                                         // fonts
};

/*****************************************************************************************************************************************/

gulp.task('usemin', function () {
  return gulp.src(paths.main)
    .pipe(usemin({
      js: [minifyJs(), 'concat'],
      css: [minifyCss({ keepSpecialComments: 0 }), 'concat'],
    }))
    .pipe(gulp.dest(dest.dest));
});

gulp.task('copy-fonts', function () {
  return gulp.src(paths.fonts)
    .pipe(rename({
      dirname: '/fonts'
    }))
    .pipe(gulp.dest(dest.fonts));
});

gulp.task('build-vendors', ['usemin', 'copy-fonts']);

/******************************************************************************************************************************************/

/**Group task for custome files images , css , sass , html and javascript */
gulp.task('custom-styles', function () {
  return gulp.src(paths.styles)
    .pipe(gulpif(argv.sourcemaps, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulpif(argv.prod, minifyCss({ keepSpecialComments: 0 })))
    .pipe(gulpif(argv.sourcemaps, sourcemaps.write('.')))
    .pipe(gulp.dest(dest.css));
});


gulp.task('custom-images', function () {

  return gulp.src(paths.images)
    .pipe(gulp.dest(dest.images));

});

gulp.task('custom-templates', function () {
  var opts = { empty: true };
  return gulp.src(paths.templates)
    .pipe(rename(function (path) {
      path.dirname = '';
    }))
    .pipe(gulpif(argv.prod, minifyHTML(opts)))
    .pipe(gulp.dest(dest.templates));

});


gulp.task('lint', function () {
  return gulp.src(paths.scripts)
    .pipe(eslint('.eslintrc'))
    .pipe(eslint.format());
});


gulp.task('custom-js', function () {

  return gulp.src(paths.scripts)
    .pipe(gulpif(argv.sourcemaps, sourcemaps.init()))
    .pipe(concat('app.min.js'))
    .pipe(gulpif(argv.prod, minifyJs()))
    .pipe(gulpif(argv.sourcemaps, sourcemaps.write('.')))
    .pipe(gulp.dest(dest.scripts));

});

gulp.task('build-custom', ['custom-images', 'custom-styles', 'custom-templates', 'lint', 'custom-js']);


// /**********************************************************************************************************************************************************/


gulp.task('watch', function () {
  gulp.watch([paths.images], ['custom-images']);
  gulp.watch([paths.styles], ['custom-styles']);
  gulp.watch([paths.scripts], ['custom-js']);
  gulp.watch([paths.templates], ['custom-templates']);
  gulp.watch([paths.main], ['usemin']);
});



// browser sync yask
gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  gulp.watch(['dist/**/*.*']).on('change', browserSync.reload);

});

gulp.task('browser-sync-test', function () {
  browserSync.init({
    server: {
      baseDir: "./",
      index: "test.html"
    }
  });
  gulp.watch(['test.html', 'src/app/**/*.spec.js']).on('change', browserSync.reload);

});

gulp.task('build', ['build-vendors', 'build-custom']);
gulp.task('default', ['build', 'watch', 'browser-sync']);
gulp.task('test', ['browser-sync-test']);
