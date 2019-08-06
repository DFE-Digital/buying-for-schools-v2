const url = require('url')
const path = require('path')
const nunjucks = require('nunjucks')
const utils = require('./utils')

const dbTreeQuestionPage = app => (req, res) => {
  const { urlInfo, lastPairDetail, summary } = res.locals
  const question = lastPairDetail.question

  const id = 'decision-tree-' + question.ref
  const radioOptions = {
    idPrefix: id,
    name: 'decision-tree',
    fieldset: {
      legend: {
        text: question.title,
        isPageHeading: true,
        classes: 'govuk-fieldset__legend--l'
      }
    }
  }

  if (question.hint) {
    radioOptions.hint = { text: question.hint }
  }

  radioOptions.items = question.options.map(option => {
    const optionUrl = path.join(urlInfo.pathname, option.ref)
    const optionHint = option.hint
    return {
      value: path.join(req.baseUrl, optionUrl),
      text: option.title,
      hint: optionHint ? { text: optionHint } : null
    }
  })

  if (radioOptions.items[0].text !== 'Yes') {
    radioOptions.items = utils.sortBy(radioOptions.items, i => i.text.toUpperCase())
  }

  let err = null
  if (urlInfo.search) {
    const errMsg = question.err || 'Please choose an option'
    radioOptions.errorMessage = { text: errMsg }
    err = {
      titleText: 'There is a problem',
      errorList: [
        {
          text: errMsg,
          href: `#${id}-1`
        }
      ]
    }
  }

  const render = nunjucks.render('question.njk', {
    locals: { frameworkPath: req.baseUrl },
    radioOptions,
    err,
    summary,
    suffix: question.suffix ? nunjucks.render(question.suffix) : '',
    pageTitle: err ? 'Error: ' + question.title : question.title
  })
  res.send(render)
}

module.exports = dbTreeQuestionPage
