const gulp      = require('gulp');

module.exports = () => {
  gulp.task( 'copy-images', () => {
    return gulp.src('./src/images/*')
      .pipe( gulp.dest('build/compile') )
      .pipe( gulp.dest('build/dist') );
  });
};
