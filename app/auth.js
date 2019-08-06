const basicAuth = require('express-basic-auth')

const auth = app => {
  const authUser = process.env.AUTHUSER || null
  const authPass = process.env.AUTHPASS || null
  if (authUser && authPass) {
    const auth = { users: {}, challenge: true }
    auth.users[authUser] = authPass
    app.use(basicAuth(auth))
    return true
  }
  
  return false
}

module.exports = auth