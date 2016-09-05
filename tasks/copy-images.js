const gulp      = require('gulp');

module.exports = () => {
  gulp.task( 'copy-images', ['clean-old-images'],() => {
    return gulp.src('./src/images/*')
      .pipe( gulp.dest('build/compile/images') )
      .pipe( gulp.dest('build/dist/images') );
  });
};
