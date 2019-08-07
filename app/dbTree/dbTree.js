const url = require('url')
const path = require('path')
const utils = require('./utils')

const dbTree = app => {
  const db = app.locals.db
  const me = {}

  me.dbTreeQuestion = require('./dbTreeQuestion')(app)
  me.dbTreeFramework = require('./dbTreeFramework')(app)
  me.dbTreeMultiple = require('./dbTreeMultiple')(app)

  me.render = (req, res) => {
    const { lastPairDetail = {}, frameworkDetails = {}, nextDetails = null } = res.locals
    if (frameworkDetails.length === 1) {
      return res.send(me.dbTreeFramework(frameworkDetails[0], res.locals.summary))
    }
    if (frameworkDetails.length) {
      return me.dbTreeMultiple(req, res)
    }

    if (lastPairDetail.question && lastPairDetail.answer && nextDetails) {
      return res.redirect(302, path.join(req.originalUrl, nextDetails.ref))
    }

    // [TODO]
    if (lastPairDetail.question && lastPairDetail.answer) {
      return res.send('DEADEND')
    }

    if (lastPairDetail.question) {
      return me.dbTreeQuestion(req, res)
    }

    // [TODO]
    res.send({ render: 'UNKNOWN', data: res.locals })
  }

  me.handleRequest = (req, res) => {
    // redirect if answered
    if (req.query && req.query['decision-tree']) {
      return res.redirect(302, req.query['decision-tree'])
    }

    res.locals.urlInfo = url.parse(req.url)

    const pairs = utils.getQuestionAnswerPairSlugs(res.locals.urlInfo.pathname)
    if (!pairs.length) {
      return res.redirect(302, path.join(req.baseUrl, 'type'))
    }

    const lastPair = pairs[pairs.length - 1]
    res.locals.pairs = pairs

    let doc
    db.getRecord()
      .then(d => doc = d)
      .then(() => pairs.map(p => utils.getPair(doc, p)))
      .then(pairDetail => {
        const lastPairDetail = pairDetail[pairDetail.length - 1]
        res.locals.lastPairDetail = lastPairDetail
        res.locals.pairDetail = pairDetail
        res.locals.summary = utils.getQuestionAnswerSummary(pairDetail, req.baseUrl)

        if (!lastPairDetail.question) {
        // look for a single recommendation
          return doc.framework.find(f => f.ref === lastPair[0])
        }
        if (lastPairDetail.question && lastPairDetail.answer) {
        // if there are recommendations at the end of the chain
          if (lastPairDetail.answer.next) {
            return doc.question.find(q => q._id.toString() === lastPairDetail.answer.next.toString())
          } else {
            return doc.framework.filter(f => lastPairDetail.answer.result.includes(f._id.toString()))
          }
        }
        return []
      }).then(nextDetails => {
        if (nextDetails && nextDetails.options) {
          res.locals.nextDetails = nextDetails
          res.locals.frameworkDetails = []
        } else {
          const frameworks = nextDetails && nextDetails._id ? [nextDetails] : nextDetails
          res.locals.frameworkDetails = frameworks.map(f => db.populateFramework(doc, f))
        }

        me.render(req, res)
      })
      .catch(err => {
        console.log('err', err)
        res.send(res.locals)
      })
  }

  return me
}

module.exports = dbTree
