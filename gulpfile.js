
const sassjs = require('sass')
const mkdirp = require('mkdirp')
const fs = require('fs')
const gulp = require('gulp')
// const jest = require('gulp-jest').default

function nodeChanges () {
  const nodemon = require('nodemon')
  return nodemon({
    script: 'app/index.js',
    ext: 'js,html,njk,json',
    env: { 'NODE_ENV': 'development', 'SURVEY': 'NO', 'AVAILABLE': 'TRUE' },
    cwd: __dirname,
    ignore: ['node_modules/**'],
    watch: ['app/*.js', 'app/templates/**/*.njk', 'app/decisionTree/*.js', 'app/*.json', 'app/dbTree/*.js', 'app/dbTree/templates/*.njk']
  })
}

function watch () {
  gulp.watch('sass/**/*.scss', gulp.series(['sass']))
  gulp.watch('app/assets', gulp.series(['assets']))
  return nodeChanges()
}

function sass () {
  return new Promise((resolve, reject) => {
    sassjs.render({
      file: 'sass/main.scss',
      includePaths: ['node_modules/govuk-elements-sass/public/sass',
        'node_modules/govuk_frontend_toolkit/stylesheets'
      ],
      // outFile: 'app/assets/styles',
      outputStyle: 'compressed'
    }, function (err, result) {
      if (!err) {
        // No errors during the compilation, write this result on the disk
        mkdirp.sync('public/assets/styles')
        fs.writeFile('public/assets/styles/main.css', result.css, function (err) {
          if (err) {
            return reject(err)
          }
          return resolve()
        })
      } else {
        console.log('ERROR', err)
      }
    })
  })
}

function assets () {
  // /node_modules/govuk-frontend/dist/govuk/assets
  return gulp
    .src([
      'node_modules/govuk-frontend/dist/govuk/assets/**/*.*', 
      'node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js', 
      'app/assets/**/*.*'
    ])
    .pipe(gulp.dest('public/assets'))
}


 
function jestTest () {
  const jest = require('gulp-jest').default
  return gulp
    .src('app/**/*.test.js')
    .pipe(jest({
    "preprocessorIgnorePatterns": [
      "<rootDir>/public/", "<rootDir>/node_modules/"
    ],
    "automock": false,
    "coverage": true
    }))
}

function build (done) {
  return gulp.series(assets, sass)(done)
}

function cucumber(done) {
  const exec = require('child_process').exec
  exec('./node_modules/.bin/cucumber-js --format node_modules/cucumber-pretty', { maxBuffer: 1024 * 500 }, (err, stdout, stderr) => {
    console.log(stdout)
    console.log(stderr)
    console.log(!!err)
    done(err)
  })
}

module.exports = {
  watch,
  sass,
  assets,
  nodeChanges,
  default: build,
  cucumber,
  jest: jestTest
}
