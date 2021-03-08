'use strict';


const fs = require('fs');
const gulp = require('gulp');


const cwd = process.cwd();
const gpath = `${cwd}/.gulp-task`;


//////////////////////////////
// PRIVATE GULP COMMUM TASK //
//////////////////////////////


const clean = require(`${gpath}/clean`);
const sassCompiler = require(`${gpath}/sass`);
const uglify = require(`${gpath}/uglify`);
const replaceInclude = require(`${gpath}/replace-include`);
const copy = require(`${gpath}/copy`);


//////////////////////
// GULP COMMUM TASK //
//////////////////////


module.exports.copy = copy;
module.exports.clean = clean;
module.exports.replaceInclude = replaceInclude;
module.exports.sass = sassCompiler.sass;
module.exports.sassmin = sassCompiler.minify;
module.exports.uglify = uglify;


module.exports.build = gulp.series(
    clean,
    gulp.parallel(sassCompiler.sass, replaceInclude),
    gulp.parallel(uglify, sassCompiler.minify, copy)
);


module.exports.default = gulp.series(
    clean,
    gulp.parallel(replaceInclude, sassCompiler.sass),
    gulp.parallel(uglify, sassCompiler.minify, copy)
);


module.exports.watch = function() {
    gulp.watch(`${cwd}/src/_templates/**/*.html`, gulp.series(replaceInclude, uglify));
    gulp.watch(`${cwd}/src/_js/**/*.js`, gulp.series(replaceInclude, uglify));
    gulp.watch(`${cwd}/src/_sass/**/*.scss`, gulp.series(sassCompiler.sass));
    gulp.watch(`${cwd}/html`, gulp.series(copy));
};
