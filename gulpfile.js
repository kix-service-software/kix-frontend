const gulp = require('gulp');
const tsc = require('gulp-tsc');
const runseq = require('run-sequence');
const clean = require('gulp-clean');
const mocha = require('gulp-mocha');
const tslint = require("gulp-tslint");
const less = require("gulp-less");
const path = require('path');
const uglify = require('gulp-uglify-es').default;

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
        runseq('clean', 'tslint', 'compile-src', 'test', 'compile-themes', 'copy-component-templates', 'copy-static', cb);
    } else {
        console.log("Build app for production.");
        runseq('clean', 'tslint', 'compile-src', 'test', 'compile-themes', 'copy-component-templates', 'uglify', 'copy-static', cb);
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
        'tests/**/*.test.ts'
    ])
        .pipe(mocha({
            reporter: 'spec',
            compilers: 'ts:ts-node/register',
            timeout: '15000'
        }));
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
