const nunjucks = require('nunjucks')
const path = require('path')

const dbTreeMultiple = app => (frameworks, urlInfo, summary) => {
  const resultList = frameworks.map(f => {
    return {
      title: f.title,
      url: path.join(urlInfo.originalUrl, f.ref),
      supplier: f.provider.initials
    }
  })

  return nunjucks.render('dbTreeMultiple.njk', {
    summary,
    locals: app.locals,
    resultList,
    pageTitle: 'Matching frameworks'
  })
}

module.exports = dbTreeMultiple
