const gulp = require('gulp');
const tsc = require('gulp-tsc');
const runseq = require('run-sequence');
const clean = require('gulp-clean');
const mocha = require('gulp-mocha');
const tslint = require("gulp-tslint");

const tslintConfig = require('./tslint.json');

gulp.task('default', (cb) => {
    runseq('tslint', 'test', 'clean', 'compile-src', 'copy-component-templates', 'copy-static', cb);
});

gulp.task('tslint', () => {
    gulp.src(['src/**/*.ts'])
        .pipe(tslint(tslintConfig))
        .pipe(tslint.report());
});

gulp.task('test', () => {
    return gulp.src(['tests/**/*.test.ts'])
        .pipe(mocha({
            reporter: 'spec',
            compilers: 'ts:ts-node/register'
        }));
});

gulp.task('clean', () => {
    return gulp
        .src(['dist', 'components'])
        .pipe(clean());
});

gulp.task('compile-src', () => {
    return gulp
        .src(['src/**/*.ts'])
        .pipe(tsc({
            target: "es6",
            lib: ["es6"],
            types: ["node"],
            module: "commonjs",
            moduleResolution: "node",
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            sourceMap: true,
            declaration: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('copy-component-templates', () => {
    return gulp
        .src(['src/components/**/*.marko', 'src/components/**/*.less', 'src/components/**/*.json'])
        .pipe(gulp.dest('dist/components'));
});

gulp.task('copy-static', () => {
    return gulp
        .src(['src/static/**/*'])
        .pipe(gulp.dest('dist/static'));
});