const express = require('express')
const serveStatic = require('serve-static')
const cookieParser = require('cookie-parser')
const device = require('express-device')
const userJourney = require('./services/userJourney')
const port = process.env.PORT || 4000
const app = express()

const auth = require('./auth.js')(app)

const serviceName = 'Find a DfE approved framework for your school'
const frameworkPath = '/find'
const listPath = '/list'
app.locals = {
  serviceName,
  frameworkPath
}

app.use(cookieParser())
app.use(device.capture())

const nunjucks = require('./nunjucksConfig')(app)

app.use(serveStatic('public/', { index: ['index.html'] }))

app.use((req, res, next) => {
  if (process.env.AVAILABLE === 'FALSE') {
    const render = nunjucks.render('unavailable.njk', { locals: app.locals })
    res.status(503)
    res.send(render)
    return
  }

  next()

  if (
    req.device.type === 'desktop' &&
    !req.url.match(/favicon\.ico/) &&
    res.statusCode >= 200 &&
    res.statusCode < 400
  ) {
    userJourney.recordStep(req, res)
  }
})

const routeInterruptionPages = require('./routeInterruptionPages')
routeInterruptionPages.route(app)

const routeIntroPages = require('./routeIntroPages')
routeIntroPages.route(app)

app.locals.db = require('./dbTree/db')({
  connectionString: process.env.MONGO_READONLY,
  docStatus: process.env.DOC_STATUS || 'LIVE'
})
const dbTree = require('./dbTree/dbTree')(app)
const dbList = require('./dbTree/dbList')(app)
app.use(frameworkPath, dbTree.handleRequest)
app.use(listPath, dbList.handleRequest)

app.get('/framework', (req, res) => {
  return res.redirect(302, '/list')
})

app.get('*', (req, res) => {
  const render = nunjucks.render('404.njk')
  res.status(404)
  res.send(render)
})

const server = app.listen(port, () => {
  console.log('Magic happens on port ' + port)
  console.log(app.locals.db.docStatus)
})

module.exports = {
  server,
  app
}
