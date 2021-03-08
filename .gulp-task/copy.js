'use strict';


const gulp = require('gulp');
const gcopy = require('gulp-copy');
const cwd = process.cwd();


function html() {
    return gulp
        .src([`${cwd}/html/*`])
        .pipe(gcopy(`${cwd}/dist`))
}

function img() {
    return gulp
        .src([`${cwd}/src/_img/*`])
        .pipe(gulp.dest(`${cwd}/dist/_img`))
}

async function copy() {
    html();
    img();
}


module.exports = copy;
