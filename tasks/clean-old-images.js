const gulp = require('gulp');
const del  = require('del');

module.exports = () => {
  gulp.task('clean-old-images', function () {
    return del([
      'build/compile/s.png',
      'build/dist/s.png',
    ]);
  });
};
