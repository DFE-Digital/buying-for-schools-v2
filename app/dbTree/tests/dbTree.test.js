const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')

const testStructure = require('./data/structure.json')

const testSummary = 'summary'
const res = { send: sinon.spy(), redirect: sinon.spy(), locals: { summary: testSummary, frameworkDetails: [], nextDetails: null } }

const getRes = () => {
  return {
    send: sinon.spy(),
    redirect: sinon.spy(),
    locals: {
      summary: testSummary,
      frameworkDetails: [],
      nextDetails: null
    }
  }
}

const getDbTree = () => {
  const dbTree = require('../dbTree')({
    locals: {
      db: {
        getRecord: () => Promise.resolve(testStructure),
        populateFramework: (doc, f) => f
      }
    }
  })
  dbTree.dbTreeFramework = sinon.spy()
  dbTree.dbTreeMultiple = sinon.spy()
  dbTree.dbTreeQuestion = sinon.spy()
  return dbTree
}

describe('dbTree', () => {
  describe('render', () => {
    it('should render a single framework result', () => {
      const testFrameworkDetails = [{ ref: 'awesome' }]
      const testRes = getRes()
      const dbTree = getDbTree()
      testRes.locals.frameworkDetails = testFrameworkDetails
      dbTree.render({}, testRes)
      expect(dbTree.dbTreeFramework.called).to.be.true
      expect(dbTree.dbTreeFramework.calledWith(testFrameworkDetails[0], testSummary)).to.be.true
      expect(testRes.send.called).to.be.true
    })

    it('should render multiple frameworks', () => {
      const testRes = getRes()
      const dbTree = getDbTree()
      testRes.locals.frameworkDetails = [{ ref: 'awesome' }, { ref: 'mediocre' }]
      dbTree.render({}, testRes)
      expect(dbTree.dbTreeMultiple.called).to.be.true
    })

    it('should redirect if the url indicates that the question has an answer and the answer leads to another question', () => {
      const testRes = getRes()
      const dbTree = getDbTree()
      testRes.locals.lastPairDetail = { question: 'colour', answer: 'red' }
      testRes.locals.nextDetails = { ref: 'food' }
      dbTree.render({ originalUrl: '/faves/colour/red' }, testRes)
      expect(testRes.redirect.args[0][0]).to.equal(302)
      expect(testRes.redirect.args[0][1]).to.equal('/faves/colour/red/food')
    })

    it('should declare DEADEND [TODO] if question is answered but doesn\'t go anywhere', () => {
      const testRes = getRes()
      const dbTree = getDbTree()
      testRes.locals.lastPairDetail = { question: 'colour', answer: 'red' }
      dbTree.render({ originalUrl: '/faves/colour/red' }, testRes)
      expect(testRes.send.lastCall.args[0]).to.equal('DEADEND')
    })

    it('should render a question if the url indicates such', () => {
      const testRes = getRes()
      const dbTree = getDbTree()

      testRes.locals.lastPairDetail = { question: 'colour' }
      dbTree.render({}, testRes)
      expect(dbTree.dbTreeQuestion.called).to.be.true
    })

    it('should render UNKNOWN [TODO] if all options are exhausted', () => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.render({}, testRes)
      expect(testRes.send.lastCall.args[0].render).to.equal('UNKNOWN')
    })
  })

  describe('handleRequest', () => {
    it('should redirect to the correct page if a query string property of decision-tree exists', () => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({ query: { 'decision-tree': '/redirect/somewhere' } }, testRes)
      expect(testRes.redirect.lastCall.args[0]).to.equal(302)
      expect(testRes.redirect.lastCall.args[1]).to.equal('/redirect/somewhere')
    })

    it('should redirect to the start of the tree if path not specified', () => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({ baseUrl: '/alpha', url: '/' }, testRes)
      expect(testRes.redirect.lastCall.args[0]).to.equal(302)
      expect(testRes.redirect.lastCall.args[1]).to.equal('/alpha/type')
    })

    it('should try to render a single framework result page', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({
        baseUrl: '/alpha',
        url: '/type/buying/what/books-media/class-library/classroom/books'
      }, testRes)
        .then(() => {
          expect(dbTree.dbTreeFramework.called).to.be.true
          expect(dbTree.dbTreeFramework.lastCall.args[0]).to.deep.equal(testStructure.framework[0])
          done()
        })
    })

    it('should try to render a multiple framework result page', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({
        baseUrl: '/alpha',
        url: '/type/services'
      }, testRes)
        .then(() => {
          expect(dbTree.dbTreeMultiple.called).to.be.true
          done()
        })
    })

    it('should redirect if path implies a question has an answer which leads to somewhere else', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({
        originalUrl: '/alpha/type/buying/what/books-media',
        url: '/type/buying/what/books-media'
      }, testRes)
        .then(() => {
          expect(testRes.redirect.called).to.be.true
          expect(testRes.redirect.lastCall.args[0]).to.equal(302)
          // console.log(res.redirect.lastCall.args)
          expect(testRes.redirect.lastCall.args[1]).to.equal('/alpha/type/buying/what/books-media/class-library')
          done()
        })
    })

    it('should report dead end if descision tree is incomplete [TODO]', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({
        originalUrl: '/alpha/type/buying/what/books-media',
        url: '/type/end'
      }, testRes)
        .then(() => {
          expect(testRes.send.called).to.be.true
          expect(testRes.send.lastCall.args[0]).to.equal('DEADEND')
          done()
        })
    })

    it('should call dbTreeFramework', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({
        url: '/type/buying/what/books-media/class-library/classroom/books'
      }, testRes)
        .then(() => {
          expect(dbTree.dbTreeFramework.called).to.be.true
          done()
        })
    })

    it('should return errors if getRecord errors', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.db.getRecord = () => Promise.reject({ errors: 'misc errors' })
      dbTree.handleRequest({
        url: '/type/buying'
      }, testRes)
        .then(() => {
          expect(testRes.send.called).to.be.true
          done()
        })
    })
  })
})
