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
const mocha = require('gulp-mocha');
const tslint = require("gulp-tslint");
const less = require("gulp-less");
const path = require('path');
const uglify = require('gulp-uglify-es').default;
const license = require('gulp-header-license');
const fs = require('fs');

const tslintConfig = require('./tslint.json');
const orgEnv = process.env.NODE_ENV;

const devTSCConfig = {
    target: "es6",
    lib: ["es2015", "dom"],
    types: ["node", "reflect-metadata"],
    module: "commonjs",
    moduleResolution: "node",
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    sourceMap: true,
    declaration: true,
    strict: true
};

const prodTSCConfig = {
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

gulp.task('default', (cb) => {
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        console.log("Build app for development.");
        runseq(
            'clean',
            'tslint',
            'license-header-ts',
            'license-header-marko',
            'license-header-less',
            'license-header-tests',
            'license-header-cucumber',
            'compile-src',
            'test', 'copy-extensions',
            'compile-themes',
            'copy-component-templates',
            'copy-static',
            cb
        );
    } else {
        console.log("Build app for production.");
        runseq(
            'clean',
            'tslint',
            'license-header-ts',
            'license-header-marko',
            'license-header-less',
            'license-header-tests',
            'license-header-cucumber',
            'compile-src',
            'test',
            'copy-extensions',
            'compile-themes',
            'copy-component-templates',
            'uglify',
            'copy-static',
            cb);
    }
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
    gulp.src('src/**/*.less')
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
    let config = prodTSCConfig;
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        console.log("Use tsconfig for development.")
        config = devTSCConfig;
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

gulp.task('test', () => {
    process.env.NODE_ENV = 'test';
    return gulp.src([
        'tests/**/*.test.ts',
        'tests/browser/**/*.test.ts'
    ])
        .pipe(mocha({
            reporter: 'spec',
            compilers: 'ts:ts-node/register',
            timeout: '15000'
        }));
});

gulp.task('copy-extensions', () => {
    return gulp
        .src(['src/extensions/**/package.json'])
        .pipe(gulp.dest('dist/extensions'));
});


gulp.task('compile-themes', () => {
    let config = prodTSCConfig;
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
        console.log("Use tsconfig for development.")
        config = devTSCConfig;
    }

    return gulp
        .src(['static/less/themes/*.less'])
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(gulp.dest('dist/themes'));
});

gulp.task('copy-component-templates', () => {
    return gulp
        .src(['src/components/**/*.marko', 'src/components/**/*.less', 'src/components/**/*.json', , 'src/components/**/static/**/*'])
        .pipe(gulp.dest('dist/components'));
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
