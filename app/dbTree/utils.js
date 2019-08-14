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
  const question = doc.question.find(q => q.ref === pair[0]) || null
  const framework = (!question && !pair[1]) ? doc.framework.find(f => f.ref === pair[0]) : null
  const answer = (question && pair[1]) ? question.options.find(a => a.ref === pair[1]) || false : null
  return { question, answer, framework }
}

const getPairDetail = (doc, pairs) => {
  const pairDetail = pairs.map(p => getPair(doc, p))
  return pairDetail
}

const validatePairChain = (pairDetail) => {
  const validate = pairDetail.map((detail, i) => {
    const isLast = (i === pairDetail.length - 1)
    const nextEntry = isLast ? null : pairDetail[i + 1]
    if (detail.answer === false) {
      // invalid answer given
      return false
    }

    if (isLast) {
      return !!((detail.question || detail.framework))
    }
    return confirmQuestionLeadsToNext(detail, nextEntry)
  })
  return !validate.includes(false)
}

const confirmQuestionLeadsToNext = (pair, next) => {
  if (pair.answer && next.question && pair.answer.next === next.question._id) {
    return true
  }
  if (pair.answer && pair.answer.result && next.framework && pair.answer.result.includes(next.framework._id)) {
    return true
  }

  return false
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

const populateFramework = (doc, f) => {
  const modifiedFramework = { ...f }
  modifiedFramework.provider = doc.provider.find(p => p._id === f.provider)
  modifiedFramework.cat = doc.category.find(c => c._id === f.cat)
  return modifiedFramework
}

module.exports = {
  sortBy,
  getQuestionAnswerPairSlugs,
  getPair,
  getPairDetail,
  getQuestionAnswerSummary,
  getProviderFull,
  getProviderShort,
  confirmQuestionLeadsToNext,
  validatePairChain,
  populateFramework
}
