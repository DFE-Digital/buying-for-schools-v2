const chai = require('chai')
const expect = chai.expect

const testStructure = require('./data/structure.json')

const mongoDB = require('mongodb')

let connectionStringCalled
let dbNameCalled
mongoDB.MongoClient = function (connStr) {
  connectionStringCalled = connStr
  this.connect = () => Promise.resolve(true)
  this.db = dbName => {
    dbNameCalled = dbName
    return Promise.resolve({
      collection: collectionName => {
        return {
          findOne: (criteria) => Promise.resolve({ ...testStructure, status: criteria.status })
        }
      }
    })
  }
}

const dbFunc = require('../db')

describe('db', () => {
  let dbObj
  before(done => {
    dbObj = dbFunc({ connectionString: 'mongoURI', dbName: 'mydbname', docStatus: 'DRAFT' })
    dbObj.connected.then(() => done())
  })

  it('should try to initialise a mongoClient with given connection string', () => {
    expect(connectionStringCalled).to.equal('mongoURI')
    expect(dbNameCalled).to.equal('mydbname')
    expect(dbObj).to.have.property('getRecord')
    expect(dbObj).to.have.property('populateFramework')
    expect(dbObj.structures).to.have.property('findOne')
  })

  describe('getRecord', () => {
    it('should return one DRAFT document', done => {
      dbObj.getRecord('DRAFT')
        .then(doc => {
          expect(doc.status).to.equal('DRAFT')
          expect(doc).to.have.property('question')
          expect(doc).to.have.property('framework')
          expect(doc).to.have.property('provider')
          expect(doc).to.have.property('category')
          done()
        })
    })

    it('should return one LIVE document', done => {
      dbObj.getRecord('LIVE')
        .then(doc => {
          expect(doc.status).to.equal('LIVE')
          expect(doc).to.have.property('question')
          expect(doc).to.have.property('framework')
          expect(doc).to.have.property('provider')
          expect(doc).to.have.property('category')
          done()
        })
    })
  })

  describe('populateFramework', () => {
    let populatedFramework
    before(() => {
      populatedFramework = dbObj.populateFramework(testStructure, testStructure.framework[0])
    })

    it('should take a framework and convert the provider ref to actual provider data', () => {
      expect(populatedFramework.provider).to.have.property('title')
      expect(populatedFramework.provider).to.have.property('initials')
    })

    it('should take a framework and convert the category ref to actual category data', () => {
      expect(populatedFramework.cat).to.have.property('title')
    })
  })
})
