import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';
import htmlmin from 'gulp-htmlmin';
import { deleteAsync } from 'del';
import webpack from 'webpack-stream';
import browserSync from 'browser-sync';

// setup base modules
const { src, dest, watch, parallel, series } = gulp;
const sass = gulpSass(dartSass);
const browsersync = browserSync.create();

// styles task
export const styles = () => 
  src([
    './app/sass/style.sass',
  ])
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer({
      cascade: false,
      grid: true,
      overrideBrowserlist: ['last 4 versions']
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(dest('./dist/css'))
    .pipe(browsersync.stream());

// script task
export const scripts = () =>
  src([
    './app/js/main.js',
  ])
     .pipe(webpack({
      mode: 'production',
      devtool: 'source-map',
      output: { filename: 'main.min.js' }
    }))
    .pipe(dest('./dist/js'))
    .pipe(browsersync.stream());

// html task
export const html = () => 
    src('./app/**/*.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(dest('./dist'));

// config browser sync
export const server = () => {
  browsersync.init({
    server: {
      baseDir: "./dist",
    },
    notify: false,
    port: 8080,
  });
};

// delete dist folder
export const clean = async () => await deleteAsync([ 'dist' ]);

// watch develop tasks
export const watcher = () => {
  watch(['./app/sass/style.sass'], styles);
  watch(['./app/js/main.js'], scripts);
  watch(['./app/**/*.html'], html);
  watch(['./app/**/*.html']).on('change', browsersync.reload);
};

// run develop tasks
export const dev = series(clean, styles, scripts, html, parallel(server, watcher));

export default dev;
