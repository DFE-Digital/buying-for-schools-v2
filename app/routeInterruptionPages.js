const interruptionPages = require("./interruptionPages").list
const nunjucks = require("nunjucks")

// NOTE - Only designed for question pages
// If you want to interrupt intro pages, just hard code it into "routeIntroPages"

const route = (app) => {
  interruptionPages.forEach(interruptionPage => {
    app.get(interruptionPage.redirectPath, (req, res, next) => {
      return res.send(nunjucks.render(interruptionPage.template, {
        locals: app.locals,
        pageTitle: interruptionPage.title
      }))
    })
  })
}

module.exports = {
  route
}
