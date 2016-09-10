const gulp      = require('gulp');
const rename    = require('gulp-rename');

module.exports = () => {
  gulp.task( 'copy-images', ['clean-old-images'],() => {
    return gulp.src('./src/images/sheet.png')
      .pipe( rename('s.png') )
      .pipe( gulp.dest('build/compile') )
      .pipe( gulp.dest('build/dist') );
  });
};
