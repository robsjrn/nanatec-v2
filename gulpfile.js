var gulp, path, less, files, minifyCss, rename,
    sourcemaps, server, uglify, reload, browserSync,util,templateCache;

path        = require('path');
gulp        = require('gulp');
less        = require('gulp-less');
uglify      = require('gulp-uglify');
concat      = require('gulp-concat');
minifyCss   = require('gulp-minify-css');
rename      = require('gulp-rename');
sourcemaps  = require('gulp-sourcemaps');
util        = require('gulp-util');
templateCache  = require('gulp-angular-templatecache');

server      = require('gulp-express');
//browserSync = require('browser-sync');
//reload      = browserSync.reload;

files = {
  libs_js  : [
     'client/libs/jquery/dist/jquery.min.js',
      'client/libs/angular/angular.js',
     'client/libs/angular-route/angular-route.js',
     'client/libs/angular-ui-router/release/angular-ui-router.js' ,
     'client/libs/angular-messages/angular-messages.js' ,  
     'client/libs/angular-xeditable/dist/js/xeditable.js', 
     'client/libs/jquery-ui/jquery-ui.min.js',
     'client/modules/thirdparty/app.min.js',
     'client/modules/thirdparty/ngDialog.min.js',
     'client/modules/thirdparty/pagination.js',
     'client/libs/bootstrap/dist/js/bootstrap.js'

      ],
  lib_css   : [
    'client/libs/angular/angular-csp.css',
    'client/libs/bootstrap/dist/css/bootstrap.css',
    'client/libs/font-awesome/css/font-awesome.css',
    'client/modules/thirdparty/AdminLTE.css',
    'client/modules/thirdparty/css/ngDialog.min.css',
    'client/modules/thirdparty/css/ngDialog-theme-default.css',
    'client/libs/angular-xeditable/dist/css/xeditable.css'
  ], 
  admin_js  : [
  
    'client/modules/admin/admin_app.js',
    'client/modules/admin/controller/**/*.js',
    'client/modules/admin/directives/**/*.js',
    'client/modules/admin/services/**/*.js'
    
      ],
  admin_css   : [
     
      'client/modules/thirdparty/skins/_all-skins.css'

      
  ], 
  propertyManager_js  : [
  
    'client/modules/property_manager/property_manager_app.js',
    'client/modules/property_manager/services/**/*.js',
    'client/modules/property_manager/controller/**/*.js',
    'client/modules/property_manager/directives/**/*.js'
    
    
      ],
  propertyManager_css   : [
     
      'client/modules/thirdparty/skins/_all-skins.css',
      'client/modules/property_manager/css/custom.css'
      
  ],
   propertyManager_templates   : [
     
      'client/modules/property_manager/templates/**/*.html'
      
  ],

   home_page_css   : [
     
      'client/modules/home/css/**/*.css',
      
  ],
  home_page_js  : [
    'client/modules/home/controller/**/*.js',
    'client/modules/home/services/**/*.js',
    'client/modules/home/directives/**/*.js'
    
    
      ],

  home_page_templates   : [
     
      'client/modules/home/templates/**/*.html'
      
  ],   

  login_js  : [
    'client/modules/login/controller/**/*.js',
    'client/modules/login/directives/**/*.js',
    'client/modules/login/services/**/*.js'
      ],

  tenant_js  : [
    'client/modules/tenant/controller/**/*.js',
    'client/modules/tenant/directives/**/*.js',
    'client/modules/tenant/services/**/*.js'
      ],
  tenant_css   : [
     'client/modules/tenant/css/**/*.css'
    
  ]
};

gulp.task('libs_js', function(){
  return gulp.src(files.libs_js)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat('libs.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('client/app/lib'))
});

gulp.task('libs_css', function(){
  return gulp.src(files.lib_css)
    .pipe(sourcemaps.init())
    .pipe(concat('lib.css'))
   .pipe(minifyCss({processImport: false}))
   .on('error', function(err){ util.log( err); })
    .pipe(gulp.dest('client/app/lib'))
});

gulp.task('Admin_css', function(){
  return gulp.src(files.admin_css)
    .pipe(sourcemaps.init())
    .pipe(concat('admin.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('client/app/admin/css'))
});
gulp.task('Admin_js', function(){
  return gulp.src(files.admin_js)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat('admin.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('client/app/admin/js'))
});

gulp.task('propertyManager_css', function(){
  return gulp.src(files.propertyManager_css)
    .pipe(sourcemaps.init())
    .pipe(concat('propertyManager.css'))
    .pipe(minifyCss())
     .on('error', function(err){ util.log( err); })
    .pipe(gulp.dest('client/app/property_manager/css'))
});
gulp.task('propertyManager_js', function(){
  return gulp.src(files.propertyManager_js)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .on('error', function(err){ util.log( err); })
    .pipe(concat('propertyManager.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('client/app/property_manager/js'))
});

gulp.task('propertyManager_templates', function(){
  return gulp.src(files.propertyManager_templates)
    .pipe(sourcemaps.init())
    .pipe(templateCache({standalone:true}))
    .pipe(gulp.dest('client/app/property_manager/templates'))
});

gulp.task('login_js', function(){
  return gulp.src(files.login_js)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .on('error', function(err){ util.log( err); })
    .pipe(concat('login.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('client/app/login/js'))
});




gulp.task('home_page_css', function(){
  return gulp.src(files.home_page_css)
    .pipe(sourcemaps.init())
    .pipe(concat('homepage.css'))
    .pipe(minifyCss())
     .on('error', function(err){ util.log( err); })
    .pipe(gulp.dest('client/app/home/css'))
});



gulp.task('home_page_js', function(){
  return gulp.src(files.home_page_js)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .on('error', function(err){ util.log( err); })
    .pipe(concat('home.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('client/app/home/js'))
});


gulp.task('home_page_templates', function(){
  return gulp.src(files.home_page_templates)
    .pipe(sourcemaps.init())
    .pipe(templateCache({standalone:true}))
    .pipe(gulp.dest('client/app/home/templates'))
});



gulp.task('browser-sync', function(){
  browserSync({
    proxy : "http://localhost:3000",
    port  : 3005
  });
});

gulp.task('server', function(){
  server.run(['app.js']);

});


gulp.task('dev', ['server','libs_js','libs_css','propertyManager_css','propertyManager_js','propertyManager_templates','login_js','home_page_css','home_page_js','home_page_templates']);
gulp.task('prod', ['propertyManager_js','propertyManager_templates','propertyManager_css']);

