const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')

const testStructure = require('./data/structure.json')
const nunjucks = require('nunjucks')

const testSummary = 'summary'

const getRes = () => {
  const me = {
    status: sinon.spy(() => me),
    send: sinon.spy(),
    redirect: sinon.spy(),
    locals: {
      summary: testSummary,
      frameworkDetails: [],
      nextDetails: null
    }
  }
  return me
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
        .finally(() => {
          const renderedFramework = dbTree.dbTreeFramework.lastCall.args[0]
          expect(dbTree.dbTreeFramework.called).to.be.true
          expect(renderedFramework.ref).to.equal(testStructure.framework[0].ref)
          expect(renderedFramework.title).to.equal(testStructure.framework[0].title)
          expect(renderedFramework.provider).to.have.property('initials')
          expect(renderedFramework.provider).to.have.property('title')
          done()
        })
    })

    it('should call dbTreeQuestion', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({
        url: '/type'
      }, testRes)
        .finally(() => {
          expect(dbTree.dbTreeQuestion.called).to.be.true
          done()
        })
    })

    it('should redirect if path implies a question has an answer which leads to another question', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({
        originalUrl: '/alpha/type/buying/what/books-media',
        url: '/type/buying/what/books-media'
      }, testRes)
        .finally(() => {
          expect(testRes.redirect.called).to.be.true
          expect(testRes.redirect.lastCall.args[0]).to.equal(302)
          expect(testRes.redirect.lastCall.args[1]).to.equal('/alpha/type/buying/what/books-media/class-library')
          done()
        })
    })

    it('should redirect if path implies a question has an answer to a single framework', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({
        originalUrl: '/alpha/type/buying/what/books-media/class-library/classroom',
        url: '/type/buying/what/books-media/class-library/classroom'
      }, testRes)
        .finally(() => {
          expect(testRes.redirect.called).to.be.true
          expect(testRes.redirect.lastCall.args[0]).to.equal(302)
          expect(testRes.redirect.lastCall.args[1]).to.equal('/alpha/type/buying/what/books-media/class-library/classroom/books')
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
        .finally(() => {
          expect(dbTree.dbTreeMultiple.called).to.be.true
          done()
        })
    })

    it('should call dbTreeFramework', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({
        url: '/type/buying/what/books-media/class-library/classroom/books'
      }, testRes)
        .finally(() => {
          expect(dbTree.dbTreeFramework.called).to.be.true
          done()
        })
    })

    it('should handle nonsense url', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      dbTree.handleRequest({
        url: '/fdsf/dsgfds/gfdsgfd'
      }, testRes)
        .finally(() => {
          expect(testRes.status.lastCall.args[0]).to.equal(404)
          done()
        })
    })

    describe('should handle bad urls with 404', () => {
      const badUrls = [
        '/type/buying/xxx/books-media/class-library/classroom/books',
        '/type/buying/what/yyyy/class-library/classroom/books',
        '/zzz/xxx/what/books-media/class-library/classroom/books',
        '/type/buying/what/books-media/class-library/classroom/books/xxx'
      ]
      badUrls.forEach(url => {
        it(`bad: ${url}`, done => {
          const testRes = getRes()
          const dbTree = getDbTree()
          dbTree.handleRequest({ url }, testRes)
            .finally(() => {
              expect(testRes.status.lastCall.args[0]).to.equal(404)
              done()
            })
        })
      })
    })

    it('should 404 if a dead end is reached', done => {
      const testRes = getRes()
      const dbTree = getDbTree()
      nunjucks.render = sinon.spy()
      dbTree.handleRequest({
        url: '/type/end'
      }, testRes)
        .finally(() => {
          expect(testRes.status.lastCall.args[0]).to.equal(404)
          expect(testRes.send.called).to.be.true
          expect(nunjucks.render.lastCall.args[0]).to.equal('404.njk')
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
        .finally(() => {
          expect(testRes.send.called).to.be.true
          done()
        })
    })
  })
})
