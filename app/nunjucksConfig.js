const path = require('path')
const nunjucks = require('nunjucks')

const nunjucksConfig = app => {
  nunjucks.configure(path.resolve(__dirname, './templates'))
  var env = nunjucks.configure([
    path.resolve(__dirname, './dbTree/templates'),
    path.resolve(__dirname, './templates'),
    path.resolve(__dirname, '../node_modules/govuk-frontend/govuk'),
    path.resolve(__dirname, '../node_modules/govuk-frontend/govuk/components/')
  ], {
    autoescape: true
  })

  app.use((req, res, next) => {
    env.addGlobal("currentUrl", req.protocol + '://' + req.get('host') + req.originalUrl)
    next()
  })

  env.addFilter("base64Encode", (string) => Buffer.from(string).toString('base64'))

  return nunjucks
}


module.exports = nunjucksConfig