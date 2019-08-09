const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const dbTreeFramework = require('../dbTreeFramework')
const testStructure = require('./data/structure.json')
const nunjucks = require('nunjucks')
nunjucks.render = (njk, props) => {
  return { template: njk, props }
}

describe('dbTreeFramework', () => {
  it('should do something', () => {
    const testing = dbTreeFramework({ locals: 'these are locals' })(testStructure.framework[0], 'summ')
    expect(testing.template).to.equal('dbTreeFramework.njk')
    expect(testing.props).to.have.property('summary', 'summ')
    expect(testing.props).to.have.property('locals')
    expect(testing.props).to.have.property('title', 'Books and related materials')
    expect(testing.props).to.have.property('pageTitle', 'Books and related materials')
    expect(testing.props).to.have.property('url', 'https://www.espo.org/Pages/Books-for-schools-framework-376E-guide')
    expect(testing.props).to.have.property('body', '<h1 id="h1">h1</h1>\n<p>para</p>\n')
  })
})
