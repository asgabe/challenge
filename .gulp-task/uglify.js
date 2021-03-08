'use strict';


const gulp = require('gulp');
const guglify = require('gulp-uglify-es').default;
const grename = require('gulp-rename');
const gsourcemaps = require('gulp-sourcemaps');
const cwd = process.cwd();


function uglify() {
    return gulp.src(`${cwd}/dist/_js/**/*.js`)
        .pipe(grename(function(path) {
            return {
                dirname: path.dirname,
                basename: path.basename += '.min',
                extname: path.extname
            }
        }))
        .pipe(gsourcemaps.init())
        .pipe(guglify())
        .pipe(gsourcemaps.write('.'))
        .pipe(gulp.dest(`${cwd}/dist/_js`));
}


module.exports = uglify;