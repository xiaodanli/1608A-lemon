var gulp = require('gulp');

var server = require('gulp-webserver');

var sass = require('gulp-sass');

gulp.task('devCss',function(){
	return gulp.src('./src/scss/*.scss')
	.pipe(sass())
	.pipe(gulp.dest('./src/css'))
})

gulp.task('watch',function(){
	return gulp.watch('./src/scss/*.scss',gulp.series('devCss'))
})

gulp.task('server',function(){
	return gulp.src('src')
	.pipe(server({
		port:8989,
		host:'localhost',
		proxies:[
			{source:'/api/getCIcon',target:'http://localhost:3000/api/getCIcon'},
			{source:'/users',target:'http://localhost:3000/users'},
			{source:'/api/addClassify',target:'http://localhost:3000/api/addClassify'},
			{source:'/api/getClassify',target:'http://localhost:3000/api/getClassify'},
			{source:'/api/addBill',target:'http://localhost:3000/api/addBill'},
			{source:'/api/selectBill',target:'http://localhost:3000/api/selectBill'},
			{source:'/api/delBill',target:'http://localhost:3000/api/delBill'}
		]
	}))
})

gulp.task('dev',gulp.series('devCss','server','watch'))