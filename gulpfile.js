var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify-es').default
    pipe = require('gulp-pipe'),
    gzip = require('gulp-gzip'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps');

// var browserSync = require('browser-sync').create();

// gulp.task('browserSync', function() {
//   browserSync.init({
//     server: {
//       baseDir: 'app'
//     },
//   })
// })

// gulp.task('watch', ['browserSync'], function (){
//   // gulp.watch('app/scss/**/*.scss', ['sass']); 
//   // // Other watchers
// })


gulp.task('default', ['copyHtml', 'copysw', 'copyCss', 'copyImages', 'minify'], function() {
  return gutil.log('Gulp is running!')
});

gulp.task('copyHtml', function() {
  // copy any html files in source/ to public/
  gulp.src('*.html').pipe(gulp.dest('dist'));
});

gulp.task('copyCss', function() {
  // copy any html files in source/ to public/
  gulp.src('css/*.css').pipe(gulp.dest('dist/css'));
});

gulp.task('copyImages', function() {
  // copy any html files in source/ to public/
  gulp.src('img/*').pipe(gulp.dest('dist/img'));
});

gulp.task('copysw', function() {
  // copy any html files in source/ to public/
  gulp.src('sw.js').pipe(gulp.dest('dist'));
  gulp.src('manifest.json').pipe(gulp.dest('dist'));
});

gulp.task('minify', function() {
  return gulp.src('js/*.js')
    .pipe(sourcemaps.init())
      //only uglify if gulp is ran with '--type production'
      // .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop()) 
    // .pipe(uglify())
    // .pipe(concat('bundle.js'))
    // .pipe(gzip())
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js/'));
});
