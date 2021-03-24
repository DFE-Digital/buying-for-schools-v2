
const nunjucks = require('nunjucks')

const getIntroPages = () => {
  const introPages = [
    {
      path: '/',
      title: 'Benefits of using a framework',
      tpl: 'intro-benefits.njk'
    },
    {
      path: '/selection',
      title: 'How frameworks are selected',
      tpl: 'intro-selection.njk'
    },
    {
      path: '/service-output',
      title: 'After you’ve used the service',
      tpl: 'intro-service-output.njk'
    },
    {
      path: '/cookies',
      title: 'cookies',
      tpl: 'cookies.njk'
    }
  ]

  return introPages
}

const routeIntroPages = (app, pages) => {
  pages.forEach(page => {
    app.get(page.path, (req, res) => {
      const render = nunjucks.render(page.tpl, {
        locals: app.locals,
        pageTitle: page.title
      })
      res.send(render)
    })
  })
}

const route = app => {
  const pages = getIntroPages()
  routeIntroPages(app, pages)
}

module.exports = {
  routeIntroPages,
  getIntroPages,
  route
}
