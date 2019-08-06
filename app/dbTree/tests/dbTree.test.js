const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')

const testStructure = require('./data/structure.json')

const dbTree = require('../dbTree')({ locals: { db: {} } })
const testSummary = 'summary'
const res = { send: sinon.spy(), redirect: sinon.spy(), locals: { summary: testSummary, frameworkDetails: [], nextDetails: null } }

describe('dbTree', () => {
  describe('render', () => {
    it('should render a single framework result', () => {
      const testFrameworkDetails = [{ ref: 'awesome' }]
      const testRes = { ...res }
      testRes.locals = { ...res.locals, frameworkDetails: testFrameworkDetails }
      dbTree.dbTreeFramework = sinon.spy()
      dbTree.render({}, testRes)
      expect(dbTree.dbTreeFramework.called).to.be.true
      expect(dbTree.dbTreeFramework.calledWith(testFrameworkDetails[0], testSummary)).to.be.true
      expect(res.send.called).to.be.true
    })

    it('should render multiple frameworks', () => {
      const testFrameworkDetails = [{ ref: 'awesome' }, { ref: 'mediocre' }]
      const testRes = { ...res }
      testRes.locals = { ...res.locals, frameworkDetails: testFrameworkDetails }
      dbTree.dbTreeMultiple = sinon.spy()
      dbTree.render({}, testRes)
      expect(dbTree.dbTreeMultiple.called).to.be.true
      expect(dbTree.dbTreeMultiple.args[0][1]).to.equal(testRes)
      expect(res.send.called).to.be.true
    })

    it('should redirect if the url indicates that the question has an answer and the answer leads to another question', () => {
      const testRes = { ...res }
      testRes.locals = {
        ...res.locals,
        lastPairDetail: { question: 'colour', answer: 'red' },
        nextDetails: { ref: 'food' }
      }
      dbTree.render({ originalUrl: '/faves/colour/red' }, testRes)
      expect(res.redirect.args[0][0]).to.equal(302)
      expect(res.redirect.args[0][1]).to.equal('/faves/colour/red/food')
    })

    it('should declare DEADEND [TODO] if question is answered but doesn\'t go anywhere', () => {
      const testRes = { ...res }
      testRes.locals = {
        ...res.locals,
        lastPairDetail: { question: 'colour', answer: 'red' }
      }
      dbTree.render({ originalUrl: '/faves/colour/red' }, testRes)
      expect(res.send.lastCall.args[0]).to.equal('DEADEND')
    })

    it('should render a question if the url indicates such', () => {
      const testRes = { ...res }
      dbTree.dbTreeQuestion = sinon.spy()
      testRes.locals = {
        ...res.locals,
        lastPairDetail: { question: 'colour' }

      }
      dbTree.render({}, testRes)
      expect(dbTree.dbTreeQuestion.args[0][1]).to.equal(testRes)
      expect(res.send.called).to.be.true
    })

    it('should render UNKNOWN [TODO] if all options are exhausted', () => {
      dbTree.render({}, res)
      expect(res.send.lastCall.args[0].render).to.equal('UNKNOWN')
    })
  })

  describe('handleRequest', () => {
    it('should redirect to the correct page if a query string property of decision-tree exists', () => {
      dbTree.handleRequest({ query: { 'decision-tree': '/redirect/somewhere' } }, res)
      expect(res.redirect.lastCall.args[0]).to.equal(302)
      expect(res.redirect.lastCall.args[1]).to.equal('/redirect/somewhere')
    })

    it('should redirect to the start of the tree if path not specified', () => {
      dbTree.handleRequest({ baseUrl: '/alpha', url: '/' }, res)
      expect(res.redirect.lastCall.args[0]).to.equal(302)
      expect(res.redirect.lastCall.args[1]).to.equal('/alpha/type')
    })
  })
})
