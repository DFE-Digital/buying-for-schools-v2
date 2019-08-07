const mongoDB = require('mongodb')
const mClient = mongoDB.MongoClient

const dbFunc = options => {
  const { connectionString, dbName, docStatus } = options
  const client = new mClient(connectionString, { useNewUrlParser: true })
  const dbObj = {}
  dbObj.docStatus = docStatus
  dbObj.connected = client.connect()
    .then(() => client.db(dbName))
    .then(connection => dbObj.structures = connection.collection('structures'))
    .then(() => console.log('connection made'))

  dbObj.getRecord = (status = docStatus) => {
    return dbObj.structures.findOne({ status }, { sort: { updatedAt: -1 } })
  }

  dbObj.populateFramework = (doc, f) => {
    const modifiedFramework = { ...f }
    modifiedFramework.provider = doc.provider.find(p => p._id.toString() === f.provider.toString())
    modifiedFramework.cat = doc.category.find(c => c._id.toString() === f.cat.toString())
    return modifiedFramework
  }

  return dbObj
}

module.exports = dbFunc
