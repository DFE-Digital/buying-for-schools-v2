/* global describe it beforeEach */
/*jshint -W030 */
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const dbTreeMultiple = require('../dbTreeMultiple')
const testStructure = require('./data/structure.json')
const nunjucks = require('nunjucks')

const testApp = { locals: 'locals' }
const testFrameworks = testStructure.framework.map(f => {
  const provider = { initials: `provider of: ${f.ref}` }
  return { ...f, provider }
})
const testUrlInfo = { originalUrl: '/alpha' }
const testSummary = 'Summary'

describe('dbTreeMultiple', () => {
  beforeEach(() => {
    nunjucks.render = sinon.spy()
  })

  it('should render dbTreeMultiple.njk', () => {
    dbTreeMultiple(testApp)(testFrameworks, testUrlInfo, testSummary)
    expect(nunjucks.render.lastCall.args[0]).to.equal('dbTreeMultiple.njk')
    const props = nunjucks.render.lastCall.args[1]
    expect(props).to.have.property('summary', 'Summary')
    expect(props).to.have.property('locals', 'locals')
    expect(props).to.have.property('pageTitle', 'Matching frameworks')
  })

  it('should extract title, url and supplier from framework details', () => {
    dbTreeMultiple(testApp)(testFrameworks, testUrlInfo, testSummary)
    const props = nunjucks.render.lastCall.args[1]
    props.resultList.forEach((f, i) => {
      const source = testStructure.framework[i]
      expect(f).to.have.property('title', source.title)
      expect(f).to.have.property('url', `/alpha/${source.ref}`)
      expect(f).to.have.property('supplier', `provider of: ${source.ref}`)
    })
  })
})
