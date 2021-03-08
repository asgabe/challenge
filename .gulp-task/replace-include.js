'use strict';


const gulp = require('gulp');
const grename = require('gulp-rename');
const greplaceInclude = require('gulp-replace-include');
const cwd = process.cwd();


function replaceInclude() {
    return gulp.src([`${cwd}/src/_js/*.js`])
        .pipe(grename(function(path) {
            return {
                dirname: path.dirname,
                basename: 'main',
                extname: path.extname
            }
        }))
        .pipe(greplaceInclude({
            prefix: '@@',
            dist: `${cwd}/src`
        }))
        .pipe(gulp.dest(`${cwd}/dist/_js`));
}


module.exports = replaceInclude;