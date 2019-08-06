const path = require('path')
const nunjucks = require('nunjucks')

const nunjucksConfig = app => {
  nunjucks.configure(path.resolve(__dirname, './templates'))
  nunjucks.configure([
    path.resolve(__dirname, './dbTree/templates'),
    path.resolve(__dirname, './templates'),
    path.resolve(__dirname, '../node_modules/govuk-frontend/'),
    path.resolve(__dirname, '../node_modules/govuk-frontend/components/')
  ], {
    autoescape: true
  })

  return nunjucks
}


module.exports = nunjucksConfig