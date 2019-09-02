const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const dbTreeQuestion = require('../dbTreeQuestion')
const testStructure = require('./data/structure.json')
const nunjucks = require('nunjucks')

describe('dbTreeQuestion', () => {
  beforeEach(() => {
    nunjucks.render = sinon.spy()
  })
  
  it('should render question.njk', () => {
    const q = dbTreeQuestion()
    const result = q(testStructure.question[0], {
      pathname: '/type',
      baseUrl: '/alpha'
    }, 'summary')
    expect(nunjucks.render.called).to.be.true
    expect(nunjucks.render.lastCall.args[0]).to.equal('question.njk')
    const props = nunjucks.render.lastCall.args[1]

    expect(props).to.have.property('locals')
    expect(props).to.have.property('radioOptions')
    expect(props).to.have.property('err')
    expect(props).to.have.property('summary', 'summary')
    expect(props).to.have.property('suffix')
    expect(props).to.have.property('pageTitle', testStructure.question[0].title)
  })

  it('should supply radio options suitable for gov uk radio template', () => {
    const q = dbTreeQuestion()
    const result = q(testStructure.question[1], {
      pathname: '/type/buying/what',
      baseUrl: '/alpha'
    }, 'summary')
    const props = nunjucks.render.lastCall.args[1]
    const radioOptions = props.radioOptions
    // console.log(radioOptions)
    expect(radioOptions).to.have.property('idPrefix', 'decision-tree-what')
    expect(radioOptions).to.have.property('name', 'decision-tree')
    expect(radioOptions).to.have.property('fieldset')
    expect(radioOptions.hint).to.have.property('text', 'Please clarify')
    expect(radioOptions.fieldset).to.have.property('legend')
    expect(radioOptions.fieldset.legend).to.have.property('text', 'What goods do you need?')

    expect(radioOptions.items.length).to.equal(3)
    expect(radioOptions.items[0]).to.have.property('value', '/alpha/type/buying/what/books-media')
    expect(radioOptions.items[0]).to.have.property('text', 'Books and related materials')
    expect(radioOptions.items[0]).to.have.property('hint', null)

    expect(radioOptions.items[2].hint).to.have.property('text', 'Computers and technology')
  })

  it('should return error messages if appropriate', () => {
    const q = dbTreeQuestion()
    const result = q(testStructure.question[1], {
      pathname: '/type/buying/what/goods',
      search: 'something',
      baseUrl: '/alpha'
    }, 'summary')
    const props = nunjucks.render.lastCall.args[1]
    const radioOptions = props.radioOptions
    expect(radioOptions).to.have.property('errorMessage')
    expect(radioOptions.errorMessage).to.have.property('text', 'Select which goods you need')
  })

  it('should sort the options into alpabetical order', () => {
    const q = dbTreeQuestion()
    const result = q({
      title: 'test',
      options: [
        {
          ref: 'z',
          title: 'z',
          next: 'z'
        },
        {
          ref: 'b',
          title: 'b',
          next: 'b'
        },
        {
          ref: 'a',
          title: 'a',
          next: 'a'
        }
      ]
    }, {
      pathname: '/type/buying/what/goods',
      baseUrl: '/alpha'
    }, 'summary')

    const props = nunjucks.render.lastCall.args[1]
    const items = props.radioOptions.items

    expect(items[0]).to.have.property('text', 'a')
    expect(items[1]).to.have.property('text', 'b')
    expect(items[2]).to.have.property('text', 'z')
  })

  it('should NOT sort the options into alpabetical order if the first item is Yes', () => {
    const q = dbTreeQuestion()
    const result = q({
      title: 'test',
      options: [
        {
          ref: 'yes',
          title: 'Yes',
          next: 'something'
        },
        {
          ref: 'no',
          title: 'No',
          next: 'something'
        },
        {
          ref: 'other',
          title: 'Other',
          next: 'something'
        }
      ]
    }, {
      pathname: '/type/buying/what/goods',
      baseUrl: '/alpha'
    },
    'summary')

    const props = nunjucks.render.lastCall.args[1]
    const items = props.radioOptions.items

    expect(items[0]).to.have.property('text', 'Yes')
    expect(items[1]).to.have.property('text', 'No')
    expect(items[2]).to.have.property('text', 'Other')
  })

  it('should set the default error message if question is not answered', () => {
    const q = dbTreeQuestion()
    const result = q(testStructure.question[2], {
      pathname: '/type/buying/what/goods/class-library',
      search: 'something',
      baseUrl: '/alpha'
    },
    'summary')
    const props = nunjucks.render.lastCall.args[1]
    const radioOptions = props.radioOptions
    expect(radioOptions).to.have.property('errorMessage')
    expect(radioOptions.errorMessage).to.have.property('text', 'Please choose an option')
  })

  it('should apply a suffix template if specified in the question properties', () => {
    const q = dbTreeQuestion()
    const result = q(testStructure.question[2], {
      pathname: '/type/buying/what/goods',
      baseUrl: '/alpha'
    },
    'summary')
    expect(nunjucks.render.calledTwice).to.be.true
    const calls = nunjucks.render.getCalls()
    expect(calls[0].args[0]).to.equal('addAnExtraHardCodedTemplateName.njk')
    expect(calls[1].args[0]).to.equal('question.njk')
  })
  
})
