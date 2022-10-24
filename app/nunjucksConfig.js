const path = require('path')
const nunjucks = require('nunjucks')
const userJourney = require('./services/userJourney')

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
    env.addGlobal("currentUrl", 'https://' + req.get('host') + req.originalUrl)
    env.addGlobal("docStatus", app.locals.db.docStatus)
    env.addGlobal("designVariant", process.env.VARIANT || 'baseline')
    env.addGlobal("sessionId", userJourney.readOrCreateSessionId(req, res))
    next()
  })

  env.addFilter("base64Encode", (string) => Buffer.from(string).toString('base64'))

  return nunjucks
}


module.exports = nunjucksConfig
