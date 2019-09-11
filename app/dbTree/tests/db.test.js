const chai = require('chai')
const expect = chai.expect

const testStructure = require('./data/structure.json')
const testConnectionString = 'mongodb://s107p01-mongo-01.documents.azure.com:10255/test_db_name?ssl=true'

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
    dbObj = dbFunc({ connectionString: testConnectionString, dbName: 'mydbname', docStatus: 'DRAFT' })
    dbObj.connected.then(() => done())
  })

  it('should try to initialise a mongoClient with given connection string', () => {
    expect(connectionStringCalled).to.equal(testConnectionString)
    expect(dbNameCalled).to.equal('test_db_name')
    expect(dbObj).to.have.property('getRecord')
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
})
