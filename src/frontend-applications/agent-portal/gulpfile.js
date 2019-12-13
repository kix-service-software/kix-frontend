module.exports = function (gulp, plugins) {
    return function () {
        gulp
            .src(
                [
                    './src/frontend-applications/agent-portal/package.json'
                ]
            ).pipe(gulp.dest('dist/frontend-applications/agent-portal'));

        gulp
            .src(
                [
                    './src/frontend-applications/agent-portal/server/**/*.json'
                ]
            ).pipe(gulp.dest('dist/frontend-applications/agent-portal/server'));

        gulp
            .src(
                [
                    './src/frontend-applications/agent-portal/server/cert/**/*'
                ]
            ).pipe(gulp.dest('dist/frontend-applications/agent-portal/server/cert'));

        gulp
            .src(
                [
                    './src/frontend-applications/agent-portal/static/**/*'
                ]
            ).pipe(gulp.dest('dist/frontend-applications/agent-portal/static'));

        // ################################
        // build common modules
        // ################################
        gulp
            .src(
                [
                    './src/frontend-applications/agent-portal/modules/**/*.json'
                ]
            ).pipe(gulp.dest('dist/frontend-applications/agent-portal/modules'));

        gulp
            .src(
                [
                    './src/frontend-applications/agent-portal/modules/**/*.marko'
                ]
            ).pipe(gulp.dest('dist/frontend-applications/agent-portal/modules'));

        gulp
            .src(
                [
                    './src/frontend-applications/agent-portal/modules/**/*.less'
                ]
            ).pipe(gulp.dest('dist/frontend-applications/agent-portal/modules'));

        gulp
            .src(
                [
                    './src/frontend-applications/agent-portal/modules/**/static/**/*'
                ]
            ).pipe(gulp.dest('dist/frontend-applications/agent-portal/modules'));

        // ################################
        // build plugins
        // ################################
        gulp
            .src(
                [
                    './src/plugins/**/*.json'
                ]
            ).pipe(gulp.dest('dist/plugins'));

        gulp
            .src(
                [
                    './src/plugins/**/*.marko'
                ]
            ).pipe(gulp.dest('dist/plugins'));

        gulp
            .src(
                [
                    './src/plugins/**/*.less'
                ]
            ).pipe(gulp.dest('dist/plugins'));

        gulp
            .src(
                [
                    './src/plugins/**/static/**/*'
                ]
            ).pipe(gulp.dest('dist/plugins'));

    };
};
