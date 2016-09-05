'use strict';

const gulp        = require('gulp');

// Bootstrap individual task files
[ 'lint', 'build', 'css', 'template', 'watch', 'zip', 'copy-images', 'clean-old-images' ]
  .forEach( task => require(`./tasks/${ task }`)() );

gulp.task( 'default', ['lint', 'copy-images', 'build', 'css', 'template', 'zip' ] );
