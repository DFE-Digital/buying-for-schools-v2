const urljoin = require('url-join')
const url = require('url')
const nunjucks = require('nunjucks')
const utils = require('./utils')
const interruptionPages = require("../interruptionPages")

const dbTreeQuestion = app => (question, urlInfo, summary) => {
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

  const options = question.options.filter(option => {
    // filter out deadend options
    return option.next || (option.result && option.result.length)
  })

  radioOptions.items = options.map(option => {
    const optionUrl = urljoin(urlInfo.baseUrl, urlInfo.pathname, option.ref)
    // If the page has an interrupt, use that path as value instead
    const value = interruptionPages.getInterruptionPath(optionUrl) || optionUrl

    return {
      value,
      text: option.title,
      hint: option.hint ? { text: option.hint } : null
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

  let suffix = ''
  if (question.suffix) {
    try {
      suffix = nunjucks.render(question.suffix)
    } catch (e) {
      suffix = ''
    }
  }

  return nunjucks.render('question.njk', {
    locals: { ...app.locals, frameworkPath: urlInfo.baseUrl },
    radioOptions,
    err,
    summary,
    suffix,
    pageTitle: err ? 'Error: ' + question.title : question.title
  })
}

module.exports = dbTreeQuestion
