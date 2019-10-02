const mongoDB = require('mongodb')
const mClient = mongoDB.MongoClient
const dbNameRegex = /.+azure.com:\d+\/([^\?]+).+/

const dbFunc = options => {
  const { connectionString, docStatus } = options
  
  const dbName = connectionString.replace(dbNameRegex, '$1')
  const client = new mClient(connectionString, { useNewUrlParser: true })
  const dbObj = {}
  dbObj.docStatus = docStatus
  dbObj.connected = client.connect()
    .then(() => client.db(dbName))
    .then(connection => dbObj.structures = connection.collection('structures'))
    .then(() => console.log('connection made'))

  dbObj.getRecord = (status = docStatus) => {
    return dbObj.structures.findOne({ status }, { sort: { updatedAt: -1 } })
      .then(doc => {
        // flatten _id objects
        doc._id = doc._id.toString()
        doc.framework.forEach(f => {
          f._id = f._id.toString()
          f.cat = f.cat.toString()
          f.provider = f.provider.toString()
        })
        doc.question.forEach(q => {
          q._id = q._id.toString()
          q.options.forEach(o => {
            o._id = o._id.toString()
            if (o.next) {
              o.next = o.next.toString()
            }
          })
        })
        doc.provider.forEach(p => {
          p._id = p._id.toString()
        })
        doc.category.forEach(c => {
          c._id = c._id.toString()
        })

        return doc
      })
  }

  return dbObj
}

module.exports = dbFunc
