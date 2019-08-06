/* global describe it expect jest */

const auth = require('./auth')

describe('auth', () => {
  it('should call app.use if process AUTHUSER AND AUTHPASS is set', () => {
    const app = {}
    process.env.AUTHUSER = 'user'
    process.env.AUTHPASS = 'pass'

    app.use = jest.fn()
    const authApplied = auth(app)
    expect(authApplied).toBeTruthy()
    expect(app.use).toBeCalled()
  })

  it('should NOT call app.use if process AUTHUSER is set without AUTHPASS', () => {
    const app = {}
    process.env.AUTHUSER = 'user'
    process.env.AUTHPASS = ''

    app.use = jest.fn()
    const authApplied = auth(app)
    expect(authApplied).toBeFalsy()
    expect(app.use).not.toBeCalled()
  })

  it('should NOT call app.use if process AUTHPASS is set without AUTHUSER', () => {
    const app = {}
    process.env.AUTHUSER = ''
    process.env.AUTHPASS = 'pass'

    app.use = jest.fn()
    const authApplied = auth(app)
    expect(authApplied).toBeFalsy()
    expect(app.use).not.toBeCalled()
  })
})