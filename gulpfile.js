var gulp = require('gulp');
var uglify = require('gulp-uglify'); 
var minifyCss = require('gulp-minify-css'); 
var imageMin = require('gulp-imagemin'); 
var concat = require('gulp-concat'); 
var plumber = require('gulp-plumber'); 
var sass = require('gulp-sass'); 
var gulpSequence = require('gulp-sequence'); 
var autoprefixer = require('gulp-autoprefixer'); 
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var del = require('del'); 
var rename = require('gulp-rename'); 
var vinylPaths = require('vinyl-paths'); 
var gulpUtil = require('gulp-util');
var gulpSourcemaps = require('gulp-sourcemaps');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');
var jQuery = require('jquery');

//////////////////Development

gulp.task('browserSync', function () {
    browserSync.init({
        server: "./src"
    });
});

gulp.task('html',function(){
    return gulp.src('src/*.html')
        .pipe(plumber())
        //.pipe(gulp.dest('src'))
        .pipe(reload({stream: true}));
});

gulp.task('cleanStyles',function(){
    return gulp.src('src/styles/app.css')
        .pipe(vinylPaths(del))
});

gulp.task('scss',['cleanStyles'],function(){
    return gulp.src('src/styles/scss/style.scss')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(gulpSourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer('> 0.01%'))
        //.pipe(autoprefixer('last 2 versions'))
        .on('error', gulpUtil.log)
        .pipe(concat('app.css'))
        .pipe(gulpSourcemaps.write())
        .pipe(gulp.dest('src/styles'))
        .pipe(browserSync.stream())
});

gulp.task('cleanScripts', function () {
    return gulp.src('src/scripts/app.js')
        .pipe(vinylPaths(del))
});

gulp.task('scripts',['cleanScripts'],function(){
    return gulp.src('src/scripts/src/entry.js')
        .pipe(webpackStream({
            output: {
                filename: 'app.js',
            },
            plugins: [
                new webpack.ProvidePlugin({
                    $: "jquery",
                    jQuery: "jquery"
                })
            ] 
        }))
        .pipe(gulp.dest('src/scripts/'))
        .pipe(browserSync.stream());
});

gulp.task('watch',function(){
    gulp.watch(['src/styles/**/*.scss', 'src/styles/**/*.css', '!src/styles/app.css'], ['scss']);
    gulp.watch(['src/scripts/src/**/*.js', '!src/scripts/app.js'], ['scripts']);
    gulp.watch('src/*.html',['html']);
});

gulp.task('default', gulpSequence(['html','scss','scripts'],'browserSync','watch'));

//////////////////Deployment

gulp.task('clean', function () {
    return gulp.src('public')
        .pipe(vinylPaths(del))
});

gulp.task('htmlDeploy',function(){
    gulp.src('src/*')
        .pipe(plumber())
        .pipe(gulp.dest('public'));
    gulp.src('src/.*')
        .pipe(plumber())
        .pipe(gulp.dest('public'));
    gulp.src('src/fonts/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('public/fonts'));
});

gulp.task('imagesDeploy',function(){
    gulp.src(['src/images/*.jpg', 'src/images/*.png','src/images/*.ico'])
        .pipe(plumber())
        .pipe(imageMin({ optimizationLevel: 5, progressive: true, interlaced: true }))
        .pipe(gulp.dest('public/images'));
});

gulp.task('scriptsDeploy',function(){
    return gulp.src('src/scripts/src/entry.js')
        .pipe(webpackStream({
            output: {
                filename: 'app.js',
            },
            plugins: [
                new webpack.ProvidePlugin({
                    $: "jquery",
                    jQuery: "jquery"
                })
            ] 
        }))
        .pipe(uglify())
        .pipe(gulp.dest('public/scripts/'));
});

gulp.task('stylesDeploy',function(){
    gulp.src(['src/styles/app.css'])
        .pipe(minifyCss())
        .pipe(gulp.dest('public/styles'))
});

gulp.task('deploy',gulpSequence('clean',['htmlDeploy','imagesDeploy','stylesDeploy','scriptsDeploy']));
