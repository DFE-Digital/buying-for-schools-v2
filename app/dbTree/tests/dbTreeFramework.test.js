/*jshint -W030 */
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const dbTreeFramework = require('../dbTreeFramework')
const testStructure = require('./data/structure.json')
const nunjucks = require('nunjucks')

describe('dbTreeFramework', () => {
  it('should do something', () => {
    nunjucks.render = sinon.spy()
    const helpFormError = 'error'
    const testing = dbTreeFramework({ locals: 'these are locals' })(testStructure.framework[0], helpFormError, 'summ')
    const template = nunjucks.render.lastCall.args[0]
    const props = nunjucks.render.lastCall.args[1]
    expect(template).to.equal('dbTreeFramework.njk')
    expect(props).to.have.property('summary', 'summ')
    expect(props).to.have.property('locals')
    expect(props).to.have.property('title', 'Books and related materials')
    expect(props).to.have.property('pageTitle', 'Books and related materials')
    expect(props).to.have.property('url', 'https://www.espo.org/Pages/Books-for-schools-framework-376E-guide')
    expect(props).to.have.property('body', '<h1 id="h1">h1</h1>\n<p>para</p>\n')
    expect(props).to.have.property('helpFormError', 'error')
  })
})
