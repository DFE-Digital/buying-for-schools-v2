const nunjucks = require('nunjucks')
const marked = require('marked')

const getProviderFull = provider => {
  if (provider.initials === provider.title || !provider.initials.trim()) {
    return provider.title
  }

  return `${provider.title} (${provider.initials})`
}

const getProviderShort = provider => {
  return provider.initials.trim() ? provider.initials : provider.title
}

const dbTreeFramework = app => (framework, summary = '') => {
  const body = framework.body || ''
  const renderedResult = nunjucks.render('dbTreeFramework.njk', {
    summary,
    locals: app.locals,
    providerFull: getProviderFull(framework.provider),
    providerShort: getProviderShort(framework.provider),
    body: marked(body),
    title: framework.title,
    url: framework.url,
    pageTitle: framework.title
  })
  return renderedResult
}

module.exports = dbTreeFramework
