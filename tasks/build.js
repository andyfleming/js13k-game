'use strict';

const gulp        = require('gulp');
const rollup      = require('rollup-stream');
const srcmaps     = require('gulp-sourcemaps');
const uglify      = require('gulp-uglify');
const buffer      = require('vinyl-buffer');
const source      = require('vinyl-source-stream');
const rename      = require('gulp-rename');

/*
build/
  compile/
  dist/           images and index.min.html
  whatever.zip
 */

module.exports = () => {

  gulp.task( 'build', [ 'build-min' ] );

  gulp.task( 'build-full', ['lint'], () => {
    return rollup({
      entry: 'src/js/main.js', format: 'iife', sourceMap: true
    })
    .pipe( source( 'main.js', './src' ) )
    .pipe( buffer() )
    .pipe( srcmaps.init({ loadMaps: true }) )
    .pipe( srcmaps.write( './' ) )
    .pipe( gulp.dest('./build/compile') )
  });

  gulp.task( 'build-min', [ 'build-full' ], () => {
    return gulp.src('./build/compile/main.js')
      .pipe( uglify(/*{
        mangle: {
          toplevel: true,
          eval: true
        },
        compress: {
          dead_code: true,
          drop_console: true,
          drop_debugger: true,
          unsafe_comps: true,
          booleans: true,
          join_vars: true,
          if_return: true,
          unused: true,
          evaluate: true,
          comparisons: true,
          conditionals: true,
          unsafe: true,
          loops: true,
          cascade: true,
          collapse_vars: true,
          warnings: true
        }
      }*/) )
      .pipe( rename('main.min.js') )
      .pipe( gulp.dest('./build/compile') );
  });
};
