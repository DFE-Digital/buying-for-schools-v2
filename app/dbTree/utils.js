const sortBy = (arr, comparisonGetter) => {
  const sortedArr = [...arr]
  sortedArr.sort((a, b) => {
    var aValue = comparisonGetter(a)
    var bValue = comparisonGetter(b)
    if (aValue < bValue) {
      return -1
    }
    if (aValue > bValue) {
      return 1
    }
    return 0
  })
  return sortedArr
}

const getQuestionAnswerPairSlugs = (url) => {
  const trimmed = url.replace(/^\/+|\/+$/g, '')
  if (!trimmed) {
    return []
  }
  const trimmedSlashes = trimmed.split('/')
  const pairs = []
  while (trimmedSlashes.length) {
    const newPair = [trimmedSlashes.shift()]
    if (trimmedSlashes.length) {
      newPair.push(trimmedSlashes.shift())
    }
    pairs.push(newPair)
  }
  return pairs
}

const getPair = (doc, pair) => {
  const question = doc.question.find(q => q.ref === pair[0])
  const answer = question ? question.options.find(a => a.ref === pair[1]) : null
  return { question, answer }
}

const getQuestionAnswerSummary = (pairDetail, baseUrl) => {
  const summary = []
  const url = []

  pairDetail.forEach(pair => {
    const { question, answer } = pair
    if (!question || !answer) {
      return summary
    }

    url.push(question.ref)
    summary.push({
      key: { text: question.title },
      value: { text: answer.title },
      actions: {
        items: [{
          href: baseUrl + '/' + url.join('/'),
          text: 'Change',
          visuallyHiddenText: question.title
        }]
      }
    })
    url.push(answer.ref)
  })
  return summary
}

const getProviderFull = provider => {
  if (provider.initials === provider.title || !provider.initials || !provider.initials.trim()) {
    return provider.title
  }

  return `${provider.title} (${provider.initials})`
}

const getProviderShort = provider => {
  return provider.initials && provider.initials.trim() ? provider.initials : provider.title
}

module.exports = {
  sortBy,
  getQuestionAnswerPairSlugs,
  getPair,
  getQuestionAnswerSummary,
  getProviderFull,
  getProviderShort
}
