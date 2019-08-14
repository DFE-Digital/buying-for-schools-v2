/* global describe it before */

const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const sinon = require('sinon')
const nunjucks = require('nunjucks')
const dbList = require('../dbList')

const testStructure = require('./data/structure.json')
const mockDB = {
  getRecord: status => Promise.resolve(testStructure),
  populateFramework: (doc, f) => {
    const modifiedFramework = { ...f }
    modifiedFramework.provider = doc.provider.find(p => p._id.toString() === f.provider.toString())
    modifiedFramework.cat = doc.category.find(c => c._id.toString() === f.cat.toString())
    return modifiedFramework
  }
}

const getRes = () => {
  const me = {
    status: sinon.spy(() => me),
    send: sinon.spy(),
    redirect: sinon.spy(),
    locals: {
      summary: 'testSummary',
      frameworkDetails: [],
      nextDetails: null
    }
  }
  return me
}

describe('dbList', () => {
  it('should return a function', () => {
    expect(dbList).to.be.a('function')
  })

  const methods = ['frameworkListPage', 'frameworkPage', 'handleRequest', 'dbTreeFramework']
  methods.forEach(m => {
    it(`should have ${m} method when initialised`, () => {
      const initialised = dbList({ locals: {} })
      expect(initialised).to.have.property(m)
      expect(initialised[m]).to.be.a('function')
    })
  })

  describe('handleRequest', () => {
    it('should call frameworkListPage when the url is /', done => {
      const testRes = getRes()
      const initialised = dbList({ locals: { db: mockDB } })
      initialised.frameworkListPage = sinon.spy(() => 'frameworkListPage')
      initialised.handleRequest({ url: '/' }, testRes)
        .finally(() => {
          expect(initialised.frameworkListPage.called).to.be.true
          expect(testRes.send.called).to.be.true
          expect(testRes.send.lastCall.args[0]).to.equal('frameworkListPage')
          done()
        })
    })

    it('should call frameworkPage when the url is /frameworkref', done => {
      const testRes = getRes()
      const initialised = dbList({ locals: { db: mockDB } })
      initialised.frameworkPage = sinon.spy(() => 'frameworkPage')
      initialised.handleRequest({ url: '/books' }, testRes)
        .finally(() => {
          expect(initialised.frameworkPage.called).to.be.true
          expect(testRes.send.called).to.be.true
          expect(testRes.send.lastCall.args[0]).to.equal('frameworkPage')
          done()
        })
    })

    it('should 404 when url requests framework which does not exist', done => {
      const testRes = getRes()
      const initialised = dbList({ locals: { db: mockDB } })
      nunjucks.render = sinon.spy()
      initialised.handleRequest({ url: '/xxx' }, testRes)
        .finally(() => {
          expect(testRes.status.called).to.be.true
          expect(testRes.status.lastCall.args[0]).to.equal(404)
          expect(testRes.send.called).to.be.true
          done()
        })
    })

    // it('should handle an error in frameworkListPage', done => {
    //   const initialised = dbList({ locals: {} })
    //   initialised.frameworkListPage = () => Promise.reject('error')
    //   initialised.handleRequest({
    //     url: '/'
    //   }, {
    //     send: content => {
    //       expect(content).equal('error')
    //       done()
    //     }
    //   })
    // })

    // it('should handle an error in frameworkPage', done => {
    //   const initialised = dbList({ locals: {} })
    //   initialised.frameworkPage = () => Promise.reject('error')
    //   initialised.handleRequest({
    //     url: '/acme'
    //   }, {
    //     send: content => {
    //       expect(content).equal('error')
    //       done()
    //     }
    //   })
    // })
  })

  describe('frameworkListPage', () => {
    const initialised = dbList({ locals: { db: mockDB } })
    let testRender
    before(() => {
      nunjucks.render = sinon.spy()
      initialised.frameworkListPage(testStructure)
      testRender = {
        template: nunjucks.render.lastCall.args[0],
        props: nunjucks.render.lastCall.args[1]
      }
    })
    it('should try to render dbList.njk', () => {
      expect(testRender.template).to.equal('dbList.njk')
      expect(testRender.props.pageTitle).to.equal('Framework list')
    })

    it('should produce a list of frameworks to render', () => {
      expect(testRender.props.grouped).to.be.an('array')
      expect(testRender.props.grouped.length).to.equal(2)
    })

    it('should return categories', () => {
      expect(testRender.props.grouped[0].title).to.equal('Books and related materials')
      expect(testRender.props.grouped[0].items.length).to.equal(2)
      expect(testRender.props.grouped[1].title).to.equal('Facilities management and estates')
      expect(testRender.props.grouped[1].items.length).to.equal(1)
    })

    it('should have frameworks that match the group', () => {
      testRender.props.grouped.forEach(g => {
        g.items.forEach(f => {
          expect(f.cat).to.equal(g._id)
        })
      })
    })

    it('should have reformatted the frameworks expiry dates', () => {
      expect(testRender.props.grouped[0].items[0].expiry).to.match(/^\d{2}\/\d{2}\/\d{4}$/)
    })
  })

  describe('frameworkPage', () => {
    it('should try to render a specific framework', () => {
      const initialised = dbList({ locals: { db: mockDB } })
      initialised.dbTreeFramework = sinon.spy(f => f)
      initialised.frameworkPage(testStructure, 'furniture')
      const testRender = initialised.dbTreeFramework.lastCall.args[0]
      expect(testRender.ref).to.equal('furniture')
      expect(testRender.title).to.equal('Furniture')
      expect(testRender.cat).to.have.property('title', 'Facilities management and estates')
      expect(testRender.provider).to.have.property('title', 'North East Procurement Organisation')
    })

    it('should return null if trying to render a framework which does not exist', () => {
      const initialised = dbList({ locals: { db: mockDB } })
      expect(initialised.frameworkPage(testStructure, 'xxx')).to.be.null
    })
  })
})
