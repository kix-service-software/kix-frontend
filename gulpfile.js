/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

const gulp = require('gulp');
const path = require('path');
const clean = require('gulp-clean');
const license = require('gulp-header-license');
const fs = require('fs');
const {series, parallel} = require('gulp');

const orgEnv = process.env.NODE_ENV;

console.log(`Node Version: ${process.version}`);

function cleanUp(cb) {
    process.env.NODE_ENV = orgEnv;
    return gulp
        .src(['dist'], {allowEmpty: true})
        .pipe(clean());
}

function licenseHeaderTS() {
    const year = new Date().getFullYear();
    return gulp.src('src/**/*.ts')
        .pipe(license(fs.readFileSync('license-ts-header.txt', 'utf8'), {year: year}))
        .pipe(gulp.dest('src/'));
}

function licenseHeaderMarko() {
    const year = new Date().getFullYear();
    return gulp.src('src/**/*.marko')
        .pipe(license(fs.readFileSync('license-html-header.txt', 'utf8'), {year: year}))
        .pipe(gulp.dest('src/'));
}

function licenseHeaderLess() {
    const year = new Date().getFullYear();
    return gulp.src(['src/**/*.less', '!src/frontend-applications/agent-portal/static/less/default/kix_font.less'])
        .pipe(license(fs.readFileSync('license-ts-header.txt', 'utf8'), {year: year}))
        .pipe(gulp.dest('src/'));
}

function licenseHeaderTests() {
    const year = new Date().getFullYear();
    return gulp.src('tests/**/*.ts')
        .pipe(license(fs.readFileSync('license-ts-header.txt', 'utf8'), {year: year}))
        .pipe(gulp.dest('tests/'));
}

function licenseHeaderCucumber() {
    const year = new Date().getFullYear();
    return gulp.src('features/**/*.feature')
        .pipe(license(fs.readFileSync('license-feature-header.txt', 'utf8'), {year: year}))
        .pipe(gulp.dest('features/'));
}

function lint() {
    const eslint = require('gulp-eslint');

    const quiet = true; //process.env.NODE_ENV !== "production" ? false : true;

    return gulp.src(['src/**/*.ts'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint({quiet: true}))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
}

function compileSrc() {
    let config = {};
    if (process.env.NODE_ENV !== 'production') {
        console.log('Use tsconfig for development.');
        config.sourceMap = true;
        config.declaration = true;
    }

    const ts = require('gulp-typescript');
    const sourcemaps = require('gulp-sourcemaps');
    const tsProject = ts.createProject('tsconfig.json', config);
    const result = tsProject
        .src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());


    return result.js
        .pipe(sourcemaps.write({
            // Return relative source map root directories per file.
            sourceRoot: function (file) {
                var sourceFile = path.join(file.cwd, file.sourceMap.file);
                return path.relative(path.dirname(sourceFile), file.cwd);
            }
        }))
        .pipe(gulp.dest('dist'));
}

function copyPlugins() {
    return gulp
        .src(
            [
                'src/plugins/readme.md',
                'src/plugins/**/*.marko', 'src/plugins/**/*.marko',
                'src/plugins/**/*.less',
                'src/plugins/**/*.json',
                'src/plugins/**/static/**/*',
                'src/plugins/**/locale/**/*',
                'src/plugins/**/RELEASE'
            ]
        )
        .pipe(gulp.dest('dist/plugins'));
}

function buildAgentPortalApp(cb) {
    gulp
        .src(['./src/frontend-applications/agent-portal/package.json'])
        .pipe(gulp.dest('dist/frontend-applications/agent-portal'));

    gulp
        .src(['./src/frontend-applications/agent-portal/server/**/*.json'])
        .pipe(gulp.dest('dist/frontend-applications/agent-portal/server'));

    gulp
        .src(['./src/frontend-applications/agent-portal/server/cert/**/*'])
        .pipe(gulp.dest('dist/frontend-applications/agent-portal/server/cert'));

    gulp
        .src(['./src/frontend-applications/agent-portal/static/**/*'])
        .pipe(gulp.dest('dist/frontend-applications/agent-portal/static'));

    gulp
        .src(['./src/frontend-applications/agent-portal/modules/**/*.json'])
        .pipe(gulp.dest('dist/frontend-applications/agent-portal/modules'));

    gulp
        .src(['./src/frontend-applications/agent-portal/modules/**/*.marko'])
        .pipe(gulp.dest('dist/frontend-applications/agent-portal/modules'));

    gulp
        .src(['./src/frontend-applications/agent-portal/modules/**/*.less'])
        .pipe(gulp.dest('dist/frontend-applications/agent-portal/modules'));

    gulp
        .src(['./src/frontend-applications/agent-portal/modules/**/static/**/*'])
        .pipe(gulp.dest('dist/frontend-applications/agent-portal/modules'));

    cb();
}

gulp.task('license-headers', (done) => {
    let tasks = [licenseHeaderTS, licenseHeaderMarko, licenseHeaderLess, licenseHeaderTests, licenseHeaderCucumber];
    gulp.series(tasks)();
    done();
});

let build = series(
    cleanUp,
    lint,
    compileSrc,
    parallel(copyPlugins, buildAgentPortalApp)
);

if (process.env.NODE_ENV === 'development') {
    build = series(
        cleanUp,
        parallel(licenseHeaderTS, licenseHeaderMarko, licenseHeaderLess, licenseHeaderTests, licenseHeaderCucumber),
        lint,
        compileSrc,
        parallel(copyPlugins, buildAgentPortalApp)
    );
}

exports.default = build;
