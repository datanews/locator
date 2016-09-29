/**
 * Gulp file for the Locator project.  This handles tasks like building,
 * linting, and other helpful development things.
 */

"use strict";

// Dependencies
var fs = require("fs");
var path = require("path");
var gulp = require("gulp");
var jshint = require("gulp-jshint");
var jscs = require("gulp-jscs");
var plumber = require("gulp-plumber");
var replace = require("gulp-replace");
var util = require("gulp-util");
var header = require("gulp-header");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var browserify = require("gulp-browserify");
var rename = require("gulp-rename");
var less = require("gulp-less");
var recess = require("gulp-recess");
var cssminify = require("gulp-minify-css");
var autoprefixer = require("gulp-autoprefixer");
var webserver = require("gulp-webserver");

// Create banner to insert into files
var pkg = require("./package.json");
var banner = ["/**",
  " * <%= pkg.name %> - <%= pkg.description %>",
  " * @version v<%= pkg.version %>",
  " * @link <%= pkg.homepage %>",
  " * @license <%= pkg.license %>",
  " * @notes External libraries may be bundled here and their respective, original license applies.",
  " */",
  ""].join("\n");

// Browser support (for autoprefixer).
var supportedBrowsers = ["> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1"];

// Plumber allows for better error handling and makes it so that
// gulp doesn"t crash so hard.  Good for watching and linting tasks
// that don't have their own reporting
var plumberHandler = function(handled) {
  return function(error) {
    if (error) {
      if (!handled) {
        console.log(error.toString());
      }

      util.beep();
    }

    this.emit("end");
  };
};

// Browserify function to easily support externals
var locatorBrowseriy = function(externals) {
  return gulp.src(["src/locator.js"])
    .pipe(plumber(plumberHandler()))
    .pipe(browserify({
      standalone: "Locator",
      bundleExternal: externals,
      shim: {
        html2canvas: {
          path: "libs/html2canvas.js",
          exports: "html2canvas"
        }
      }
    }))
    .pipe(replace(
      "REPLACE-DEFAULT-TEMPLATE",
      fs.readFileSync("src/locator.html.tpl", {
        encoding: "utf-8"
      }).replace(/"/g, "\\\"").replace(/(\r\n|\n|\r|\s+)/g, " ")
    ))
    .pipe(header(banner, { pkg: pkg }));
};

// Support JS is a task to look at the supporting JS, like this
// file
gulp.task("support-js", function() {
  return gulp.src(["gulpfile.js"])
    .pipe(plumber(plumberHandler(true)))
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"))
    .pipe(jscs());
});

// Linting and related tasks
gulp.task("js-linting", function() {
  return gulp.src("src/**/*.js")
    .pipe(plumber(plumberHandler(true)))
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"))
    .pipe(jscs());
});

// Main JS task.  Takes in files from src and outputs
// to dist.  Gets template and add header, concats, minify
gulp.task("js", ["js-linting"], function() {
  return locatorBrowseriy(false)
    .pipe(gulp.dest("dist"))

    // Create minified version
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(gulp.dest("dist"));
});

// Style linting for any less
gulp.task("styles-lint", function() {
  return gulp.src("src/**/*.less")
    .pipe(plumber(plumberHandler(true)))
    .pipe(recess({
      strictPropertyOrder: false,
      noOverqualifying: false,
      noUniversalSelectors: false
    }))
    .pipe(recess.reporter({
      fail: true
    }));
});

// Styles.  Convert LESS to CSS, lint, minify
gulp.task("styles", ["styles-lint"], function() {
  return gulp.src("src/locator.less")
    .pipe(plumber(plumberHandler()))
    .pipe(less({
      paths: [
        path.join(__dirname, "src", "styles")
      ]
    }))
    .pipe(recess({
      strictPropertyOrder: false,
      noOverqualifying: false,
      noUniversalSelectors: false
    }))
    .pipe(recess.reporter({
      fail: true
    }))
    .pipe(autoprefixer({
      browsers: supportedBrowsers
    }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest("dist"))
    .pipe(cssminify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(gulp.dest("dist"));
});

// Bundle with libs
gulp.task("bundle-js", ["js"], function() {
  return locatorBrowseriy(true)
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({
      extname: ".bundled.min.js"
    }))
    .pipe(gulp.dest("dist"));
});

// Bundle styles
gulp.task("bundle-styles", ["styles"], function() {
  var cssDeps = [
    "node_modules/leaflet/dist/leaflet.css",
    "node_modules/leaflet-draw/dist/leaflet.draw.css",
    "node_modules/leaflet-minimap/dist/Control.MiniMap.min.css"
  ];

  return gulp.src(cssDeps.concat(["dist/locator.css"]))
    .pipe(plumber(plumberHandler()))
    .pipe(concat("locator.bundled.css"))
    .pipe(cssminify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(gulp.dest("dist"));
});

// Watch for files that need to be processed
gulp.task("watch", function() {
  gulp.watch(["gulpfile.js"], ["support-js"]);
  gulp.watch(["src/**/*.js", "libs/**/*.js", "src/**/*.tpl"], ["bundle-js"]);
  gulp.watch("src/**/*.less", ["bundle-styles"]);
});

// Web server for conveinence
gulp.task("webserver", function() {
  return gulp.src("./")
    .pipe(webserver({
      port: 8089,
      livereload: {
        enable: true,
        filter: function(file) {
          // Only watch dist and examples
          return (file.match(/dist.*bundled|examples|index\.html/)) ? true : false;
        }
      },

      // Directory listing means that the fallback wont work
      //directoryListing: true,
      open: true,
      fallback: "index.html"
    }));
});

// Default task is a basic build
gulp.task("default", ["support-js", "bundle-js", "bundle-styles"]);

// Combine webserver and watch tasks for a more complete server
gulp.task("server", ["default", "watch", "webserver"]);
