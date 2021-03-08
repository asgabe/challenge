'use strict';


const gulp = require('gulp');
const gsass = require('gulp-sass');
const grename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const cwd = process.cwd();


gsass.compiler = require('node-sass');


function sassCompile() {
    return gulp.src(`${cwd}/src/_sass/*.scss`)
        .pipe(sourcemaps.init())
        .pipe(gsass().on('error', gsass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(`${cwd}/dist/_css`));
}


function sassMinify() {
    return gulp.src(`${cwd}/src/_sass/*.scss`)
        .pipe(grename(function(path) {
            return {
                dirname: path.dirname,
                basename: path.basename += '.min',
                extname: path.extname
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(gsass({outputStyle: 'compressed'}).on('error', gsass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(`${cwd}/dist/_css`));
}


module.exports.sass = sassCompile;
module.exports.minify = sassMinify;