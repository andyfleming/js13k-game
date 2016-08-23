const gulp      = require('gulp');
const zip       = require('gulp-zip');
const rename    = require('gulp-rename');
const size      = require('gulp-size');

module.exports = () => {
  gulp.task( 'zip', [ 'build', 'template' ], () => {
    return gulp.src('./build/dist/*')
      .pipe( zip('game.zip') )
      .pipe( size() )
      .pipe( gulp.dest('build') );
  });
};
