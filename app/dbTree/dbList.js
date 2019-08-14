const url = require('url')
const moment = require('moment')
const nunjucks = require('nunjucks')
const utils = require('./utils')

const dbList = app => {
  const db = app.locals.db
  const me = {}
  me.dbTreeFramework = require('./dbTreeFramework')(app)

  me.frameworkListPage = doc => {
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
  }

  me.frameworkPage = (doc, ref) => {
    const framework = doc.framework.find(f => f.ref === ref)
    if (!framework) {
      return null
    }
    return me.dbTreeFramework(utils.populateFramework(doc, framework))
  }

  me.handleRequest = (req, res) => {
    return db.getRecord().then(doc => {
      const urlInfo = url.parse(req.url)
      if (urlInfo.pathname === '/') {
        const render = me.frameworkListPage(doc)
        return res.send(render)
      }

      const ref = urlInfo.pathname.substr(1)
      const render = me.frameworkPage(doc, ref)
      if (!render) {
        console.log('404')
        return res.status(404).send(nunjucks.render('404.njk'))
      }
      return res.send(render)
    })
  }

  return me
}

module.exports = dbList
