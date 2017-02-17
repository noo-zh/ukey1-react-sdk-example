var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function() {
  return gulp.src('src/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('src/css'));
});

gulp.task('default', ['less']);

gulp.task('dev', ['less'], function() {
  gulp.watch('src/less/*.less', ['less']);
});
