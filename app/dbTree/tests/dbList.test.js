const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const nunjucks = require('nunjucks')
nunjucks.render = (njk, props) => {
  return { template: njk, props }
}

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
      const initialised = dbList({ locals: {} })
      initialised.frameworkListPage = () => Promise.resolve('listpage')
      initialised.handleRequest({
        url: '/'
      }, {
        send: content => {
          expect(content).equal('listpage')
          done()
        }
      })
    })

    it('should call frameworkPage when the url is /${frameworkref}', done => {
      const initialised = dbList({ locals: {} })
      initialised.frameworkPage = (ref) => Promise.resolve(`frameworkpage ${ref}`)
      initialised.handleRequest({
        url: '/books'
      }, {
        send: content => {
          expect(content).equal('frameworkpage books')
          done()
        }
      })
    })

    it('should handle an error in frameworkListPage', done => {
      const initialised = dbList({ locals: {} })
      initialised.frameworkListPage = () => Promise.reject('error')
      initialised.handleRequest({
        url: '/'
      }, {
        send: content => {
          expect(content).equal('error')
          done()
        }
      })
    })

    it('should handle an error in frameworkPage', done => {
      const initialised = dbList({ locals: {} })
      initialised.frameworkPage = () => Promise.reject('error')
      initialised.handleRequest({
        url: '/acme'
      }, {
        send: content => {
          expect(content).equal('error')
          done()
        }
      })
    })
  })

  describe('frameworkListPage', () => {
    const initialised = dbList({ locals: { db: mockDB } })
    let testRender
    before(done => {
      initialised.frameworkListPage().then(results => {
        testRender = results
        done()
      })
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
    const initialised = dbList({ locals: { db: mockDB } })
    let attemptingToRenderFramework
    before(done => {
      initialised.dbTreeFramework = framework => framework
      initialised.frameworkPage('furniture').then(results => {
        attemptingToRenderFramework = results
        done()
      })
    })

    it('should try to render a specific framework', () => {
      expect(attemptingToRenderFramework.ref).to.equal('furniture')
      expect(attemptingToRenderFramework.title).to.equal('Furniture')
      expect(attemptingToRenderFramework.cat).to.have.property('title', 'Facilities management and estates')
      expect(attemptingToRenderFramework.provider).to.have.property('title', 'North East Procurement Organisation')
      // expect(testRender.template).to.equal('dbTreeFramework.njk')
      // expect(testRender.props.pageTitle).to.equal('Books and related materials')
    })
  })
})
