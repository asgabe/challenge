'use strict';


const gulp = require('gulp');
const gclean = require('gulp-clean');
const cwd = process.cwd();


const clean = function(data) {
    let folderpath = {
        build: `${cwd}/dist/*`,
        js: `${cwd}/dist/_js/*`,
        css: `${cwd}/dist/_css/*`
    };

    let folder = (!data || ['build', 'js', 'css'].indexOf(data.type) < 0) ? folderpath['build'] : folderpath[data.type];

    return gulp
        .src(folder, {read: false})
        .pipe(gclean());
}


module.exports = clean;
