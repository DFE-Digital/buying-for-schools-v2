const nunjucks = require('nunjucks')
const path = require('path')

const dbTreeMultiple = app => (req, res) => {
  const { serviceName } = app.locals
  const { summary, frameworkDetails } = res.locals

  const resultList = frameworkDetails.map(f => {
    return {
      title: f.title,
      url: path.join(req.originalUrl, f.ref),
      supplier: f.provider.initials
    }
  })

  const renderedResult = nunjucks.render('dbTreeMultiple.njk', {
    summary,
    locals: app.locals,
    resultList,
    pageTitle: 'Matching frameworks'
  })
  return res.send(renderedResult)
}

module.exports = dbTreeMultiple
