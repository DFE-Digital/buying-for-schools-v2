const urljoin = require('url-join')
const url = require('url')
const path = require('path')
const utils = require('./utils')
const nunjucks = require('nunjucks')
const userJourney = require('../services/userJourney')

const dbTree = app => {
  const me = {}
  me.db = app.locals.db
  me.dbTreeQuestion = require('./dbTreeQuestion')(app)
  me.dbTreeFramework = require('./dbTreeFramework')(app)
  me.dbTreeMultiple = require('./dbTreeMultiple')(app)

  me.handleRequest = (req, res) => {
    if (req.query && req.query['decision-tree']) {
      return res.redirect(302, req.query['decision-tree'])
    }

    const urlInfo = url.parse(req.url)
    urlInfo.baseUrl = req.baseUrl
    urlInfo.originalUrl = req.originalUrl

    const pairs = utils.getQuestionAnswerPairSlugs(urlInfo.pathname)
    if (!pairs.length) {
      return res.redirect(302, urljoin(req.baseUrl, 'type'))
    }

    return me.db.getRecord()
      .then(doc => {
        const pairDetail = utils.getPairDetail(doc, pairs)
        const isValid = utils.validatePairChain(pairDetail)

        if (!isValid) {
          return res.status(404).send(nunjucks.render('404.njk'))
        }

        const summary = utils.getQuestionAnswerSummary(pairDetail, req.baseUrl)

        const lastPairDetail = pairDetail[pairDetail.length - 1]
        if (lastPairDetail.framework) {
          // render a single framework
          const populated = utils.populateFramework(doc, lastPairDetail.framework)
          userJourney.recordStep(req, res)
          return res.send(me.dbTreeFramework(populated, summary))
        }

        if (lastPairDetail.question && !lastPairDetail.answer) {
          // render unanswered question
          userJourney.recordStep(req, res)
          return res.send(me.dbTreeQuestion(lastPairDetail.question, urlInfo, summary))
        }

        const nextQuestion = doc.question.find(q => q._id === lastPairDetail.answer.next)
        if (nextQuestion) {
          // go to next question
          return res.redirect(302, urljoin(req.originalUrl, nextQuestion.ref))
        }

        if (lastPairDetail.answer.result.length === 1) {
          const f = doc.framework.find(f => f._id === lastPairDetail.answer.result[0])
          // the question is answered and there is only one framework to go to
          return res.redirect(302, urljoin(req.originalUrl, f.ref))
        }

        if (lastPairDetail.answer.result.length > 1) {
          // render multiple frameworks
          const frameworks = doc.framework.filter(f => lastPairDetail.answer.result.includes(f._id))
          const populated = frameworks.map(f => utils.populateFramework(doc, f))
          userJourney.recordStep(req, res)
          return res.send(me.dbTreeMultiple(populated, urlInfo, summary))
        }

        return res.status(404).send(nunjucks.render('404.njk'))
      })
      .catch(err => {
        console.log('err', err)
        res.send(err)
      })
  }

  return me
}

module.exports = dbTree
