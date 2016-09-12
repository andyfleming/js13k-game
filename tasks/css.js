const gulp        = require('gulp');
const concat      = require('gulp-concat-css');
const cleanCSS    = require('gulp-clean-css')

module.exports = () => {
  gulp.task( 'css', function () {
    return gulp.src( [ 'src/css/reset.css', 'src/css/**/*.css' ] )
      .pipe( concat('main.css') )
      .pipe( cleanCSS() )
      .pipe( gulp.dest('./build/compile') )
  });
};
