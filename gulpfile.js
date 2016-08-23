'use strict';

const gulp        = require('gulp');

// Bootstrap individual task files
[ 'build', 'css', 'template', 'watch', 'zip', 'copy-images' ]
  .forEach( task => require(`./tasks/${ task }`)() );

gulp.task( 'default', ['copy-images', 'build', 'css', 'template', 'zip' ] );
