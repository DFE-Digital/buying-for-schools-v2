const url = require('url')
const moment = require('moment')
const nunjucks = require('nunjucks')
const utils = require('./utils')

const dbList = app => {
  const db = app.locals.db
  const me = {}
  me.dbTreeFramework = require('./dbTreeFramework')(app)

  me.frameworkListPage = () => {
    return db.getRecord()
      .then(doc => {
        const categories = doc.category.map(c => {
          const frameworks = doc.framework.filter(f => f.cat.toString() === c._id.toString())
          frameworks.forEach(f => f.expiry = f.expiry ? moment(f.expiry).format('DD/MM/YYYY') : '')
          return { ...c, items: utils.sortBy(frameworks, f => f.title) }
        })
        const renderedResult = nunjucks.render('dbList.njk', {
          locals: app.locals,
          grouped: utils.sortBy(categories, c => c.title),
          pageTitle: 'Framework list'
        })
        return renderedResult
      })
  }

  me.frameworkPage = ref => {
    return db.getRecord()
      .then(doc => {
        const framework = doc.framework.find(f => f.ref === ref)
        return me.dbTreeFramework(db.populateFramework(doc, framework))
      })
  }

  me.handleRequest = (req, res) => {
    const urlInfo = url.parse(req.url)
    if (urlInfo.pathname === '/') {
      me.frameworkListPage()
        .then(render => res.send(render))
        .catch(err => res.send(err))
    } else {
      me.frameworkPage(urlInfo.pathname.substr(1), res)
        .then(render => res.send(render))
        .catch(err => res.send(err))
    }
  }

  return me
}

module.exports = dbList
