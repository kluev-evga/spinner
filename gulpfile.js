const { src, dest } = require('gulp')
const gulp = require('gulp')
const plumber = require('gulp-plumber')
const browserSync = require('browser-sync').create()

const sass = require('gulp-sass')(require('sass'))
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')

const rename = require('gulp-rename')
const del = require('del')
const notify = require('gulp-notify')

const htmlmin = require('gulp-htmlmin-next')

const imagemin = require('gulp-imagemin')
const webp = require('gulp-webp')

const webpack = require('webpack')
const webpackStream = require('webpack-stream')

const fileinclude = require('gulp-file-include')

/* Paths */
const srcPath = 'src/'
const distPath = 'build/'

const path = {
   build: {
      html: distPath,
      js: distPath + 'assets/js/',
      css: distPath + 'assets/css/',
      images: distPath + 'assets/images/',
      webp: distPath + 'assets/images/webp',
      fonts: distPath + 'assets/fonts/',
   },
   src: {
      html: srcPath + '*.html',
      js: srcPath + 'assets/js/*.js',
      css: srcPath + 'assets/scss/*.scss',
      images: srcPath + 'assets/images/**/*.{jpg,png,svg,gif,ico,webp}',
      fonts: srcPath + 'assets/fonts/**/*.{eot,woff,woff2,ttf,svg}',
   },
   watch: {
      html: srcPath + '**/*.html',
      js: srcPath + 'assets/js/**/*.js',
      css: srcPath + 'assets/scss/**/*.scss',
      images: srcPath + 'assets/images/**/*.{jpg,png,svg,gif,ico,webp}',
      fonts: srcPath + 'assets/fonts/**/*.{eot,woff,woff2,ttf,svg}',
   },
   clean: './' + distPath,
}

/* Tasks */
function serve() {
   browserSync.init({
      server: { baseDir: './' + distPath, index: 'index.html' },
      port: 3000,
      notify: false,
   })
}

function html(cb) {
   return src(path.src.html, { base: srcPath })
      .pipe(plumber())
      .pipe(fileinclude())
      .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
      .pipe(dest(path.build.html))
      .pipe(browserSync.reload({ stream: true }))
   cb()
}

function css(cb) {
   return src(path.src.css, { base: srcPath + 'assets/scss/' })
      .pipe(sourcemaps.init())
      .pipe(
         plumber({
            errorHandler: function (err) {
               notify.onError({
                  title: 'SCSS Error',
                  message: 'Error: <%= error.message %>',
               })(err)
               this.emit('end')
            },
         })
      )
      .pipe(sass({ includePaths: './node_modules/' }))
      .pipe(autoprefixer({ cascade: true }))
      .pipe(cleanCSS({ compatibility: '*' }))
      .pipe(rename({ suffix: '.min', extname: '.css' }))
      .pipe(sourcemaps.write('./'))
      .pipe(dest(path.build.css))
      .pipe(browserSync.reload({ stream: true }))

   cb()
}

function cssWatch(cb) {
   return src(path.src.css, {
      base: srcPath + 'assets/scss/', // src/sass/**/*.+(scss | sass | css)
   })
      .pipe(
         plumber({
            errorHandler: function (err) {
               notify.onError({
                  title: 'SCSS Error',
                  message: 'Error: <%= error.message %>',
               })(err)
               this.emit('end')
            },
         })
      )
      .pipe(sass({ includePaths: './node_modules/' }))
      .pipe(rename({ suffix: '.min', extname: '.css' }))
      .pipe(dest(path.build.css))
      .pipe(browserSync.reload({ stream: true }))
   cb()
}

function js(cb) {
   return src(path.src.js, { base: srcPath + 'assets/js/' })
      .pipe(
         plumber({
            errorHandler: function (err) {
               notify.onError({
                  title: 'JS Error',
                  message: 'Error: <%= error.message %>',
               })(err)
               this.emit('end')
            },
         })
      )
      .pipe(
         webpackStream({
            mode: 'production',
            devtool: 'source-map',
            output: { filename: 'app.js' },
            module: {
               rules: [
                  {
                     test: /\.(js)$/,
                     exclude: /(node_modules)/,
                     loader: 'babel-loader',
                  },
               ],
            },
         })
      )
      .pipe(dest(path.build.js))
      .pipe(browserSync.reload({ stream: true }))
   cb()
}

function jsWatch(cb) {
   return src(path.src.js, { base: srcPath + 'assets/js/' })
      .pipe(
         plumber({
            errorHandler: function (err) {
               notify.onError({
                  title: 'JS Error',
                  message: 'Error: <%= error.message %>',
               })(err)
               this.emit('end')
            },
         })
      )
      .pipe(
         webpackStream({ mode: 'development', output: { filename: 'app.js' } })
      )
      .pipe(dest(path.build.js))
      .pipe(browserSync.reload({ stream: true }))
   cb()
}

function images(cb) {
   return src(path.src.images)
      .pipe(
         imagemin([
            imagemin.svgo({
               plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
            }),
         ])
      )
      .pipe(webp({ lossless: true, quality: 80, alphaQuality: 90 }))
      .pipe(dest(path.build.images))
      .pipe(browserSync.reload({ stream: true }))
   cb()
}

function fonts(cb) {
   return src(path.src.fonts)
      .pipe(dest(path.build.fonts))
      .pipe(browserSync.reload({ stream: true }))
   cb()
}

function clean(cb) {
   return del(path.clean)
   cb()
}

function watchFiles() {
   gulp.watch([path.watch.html], html)
   gulp.watch([path.watch.css], cssWatch)
   gulp.watch([path.watch.js], jsWatch)
   gulp.watch([path.watch.images], images)
   gulp.watch([path.watch.fonts], fonts)
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts))
const watch = gulp.parallel(build, watchFiles, serve)

/* Exports Tasks */
exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.fonts = fonts
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch
