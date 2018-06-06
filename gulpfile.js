const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');
const ts = require('gulp-typescript');
const merge = require('merge-stream');
const { Linter } = require('tslint');

const sources = ['src/**/*.ts', '!**/*.test.*'];

gulp.task('compile', () => {
  const tsProject = ts.createProject('tsconfig.json', { module: 'commonjs' });

  const transpiled = gulp.src(sources)
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib'));

  const copied = gulp.src(['src/**/*.d.ts'])
    .pipe(gulp.dest('lib'));

  return merge(transpiled, copied)
    .on('error', () => process.exit(1));
});

gulp.task('type-check', () => {
  const tsProject = ts.createProject('tsconfig.json', { noEmit: true });

  gulp.src(sources)
    .pipe(tsProject())
    .on('error', () => process.exit(1));
});

gulp.task('tslint', () => {
  gulp.src(sources)
    .pipe(tslint({
      configuration: 'tslint.json',
      fix: true,
      formatter: 'stylish',
      program: Linter.createProgram('tsconfig.json'),
    }))
    .pipe(tslint.report())
    .on('error', () => process.exit(1));
});
