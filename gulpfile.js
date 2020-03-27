/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

const gulp = require('gulp');
const tsc = require('gulp-tsc');
const runseq = require('run-sequence');
const clean = require('gulp-clean');
const tslint = require("gulp-tslint");
const less = require("gulp-less");
const uglify = require('gulp-uglify-es').default;
const license = require('gulp-header-license');
const fs = require('fs');

var plugins = require('gulp-load-plugins')();

const tslintConfig = require('./tslint.json');
const orgEnv = process.env.NODE_ENV;

gulp.task('default', (cb) => {

    let tasks = [
        'clean',
        'tslint',
        'license-header-ts',
        'license-header-marko',
        'license-header-less',
        'license-header-tests',
        'license-header-cucumber',
        'compile-src',
        'copy-plugins',
        'compile-themes'
    ];

    if (process.env.NODE_ENV === "production") {
        tasks.push('uglify');
    }

    tasks = [
        ...tasks,
        'copy-static',
        'build-apps-agent'
    ];

    runseq(...tasks, cb);
});

gulp.task('clean', () => {
    process.env.NODE_ENV = orgEnv;
    return gulp
        .src(['dist'])
        .pipe(clean());
});

gulp.task('tslint', () => {
    gulp.src(['src/**/*.ts'])
        .pipe(tslint(tslintConfig))
        .pipe(tslint.report());
});

gulp.task('license-header-ts', () => {
    gulp.src('src/**/*.ts')
        .pipe(license(fs.readFileSync('license-ts-header.txt', 'utf8')))
        .pipe(gulp.dest('src/'));
});

gulp.task('license-header-marko', () => {
    gulp.src('src/**/*.marko')
        .pipe(license(fs.readFileSync('license-html-header.txt', 'utf8')))
        .pipe(gulp.dest('src/'));
});

gulp.task('license-header-less', () => {
    gulp.src(['src/**/*.less', '!src/frontend-applications/agent-portal/static/less/default/kix_font.less'])
        .pipe(license(fs.readFileSync('license-ts-header.txt', 'utf8')))
        .pipe(gulp.dest('src/'));
});

gulp.task('license-header-tests', () => {
    gulp.src('tests/**/*.ts')
        .pipe(license(fs.readFileSync('license-ts-header.txt', 'utf8')))
        .pipe(gulp.dest('tests/'));
});

gulp.task('license-header-cucumber', () => {
    gulp.src('features/**/*.feature')
        .pipe(license(fs.readFileSync('license-feature-header.txt', 'utf8')))
        .pipe(gulp.dest('features/'));
});

gulp.task('compile-src', () => {
    let config = {
        target: "es6",
        lib: ["es2015", "dom"],
        types: ["node", "reflect-metadata"],
        module: "commonjs",
        moduleResolution: "node",
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        sourceMap: false,
        declaration: false,
        strict: true
    };

    if (process.env.NODE_ENV !== "production") {
        console.log("Use tsconfig for development.")
        config.sourceMap = true;
        config.declaration = true;
    }

    return gulp
        .src(['src/**/*.ts'])
        .pipe(tsc(config))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-js', (cb) => {
    return gulp.src('dist/**/*.js')
        .pipe(babel({
            presets: [
                ["env", {
                    "targets": {
                        "node": "current"
                    }
                }],
                'es2015',
                'minify'],
            plugins: [
                'babel-plugin-transform-class'
            ]

        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('compile-themes', () => {
    return gulp
        .src(['static/less/themes/*.less'])
        .pipe(less())
        .pipe(gulp.dest('dist/themes'));
});

gulp.task('copy-plugins', () => {
    return gulp
        .src(['src/plugins/**/*.marko', 'src/plugins/**/*.marko', 'src/plugins/**/*.less', 'src/plugins/**/*.json', 'src/plugins/**/static/**/*'])
        .pipe(gulp.dest('dist/plugins'));
});

gulp.task('copy-static', () => {
    return gulp
        .src(['src/static/**/*'])
        .pipe(gulp.dest('dist/static'));
});

gulp.task("uglify", function () {
    return gulp.src("dist/**/*.js")
        .pipe(uglify({
            ecma: 6,
            keep_classnames: false,
            keep_fnames: false,
        }))
        .pipe(gulp.dest("dist/"));
});

console.log(__dirname);
gulp.task('build-apps-agent', require('./src/frontend-applications/agent-portal/gulpfile.js')(gulp, plugins));
