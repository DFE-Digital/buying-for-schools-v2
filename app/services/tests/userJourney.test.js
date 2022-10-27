const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const userJourney = require('../userJourney')

describe('userJourney', () => {
  describe('#getSessionId', () => {
    it('returns the sessionId from the cookies on the request', () => {
      const req = { cookies: { sessionId: '21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3' } }
      const res = {}

      expect(userJourney.getSessionId(req, res)).to.equal('21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3')
    })

    it('returns the sessionId from the set-cookie header on the response', () => {
      const req = { cookies: {} }
      const resStub = { getHeader: sinon.stub().returns('sessionId=21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3; Path=/') }

      expect(userJourney.getSessionId(req, resStub)).to.equal('21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3')
      expect(resStub.getHeader.calledOnce).to.be.true
      expect(resStub.getHeader.calledWith('set-cookie')).to.be.true
    })
  })

  describe('#setSessionId', () => {
    it('sets the sessionId cookie', () => {
      const res = {
        cookie: sinon.spy()
      }
      const crypto = require('crypto')
      const randomUUIDStub = sinon.stub(crypto, 'randomUUID').returns('21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3')

      const sessionId = userJourney.setSessionId(res)

      expect(randomUUIDStub.calledOnce).to.be.true
      expect(res.cookie.calledOnce).to.be.true
      expect(res.cookie.calledWith('sessionId', '21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3')).to.be.true
      expect(sessionId).to.equal('21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3')
    })
  })

  describe('#readOrCreateSessionId', () => {
    var getSessionIdStub
    var setSessionIdStub

    afterEach(() => {
      getSessionIdStub.restore()
      setSessionIdStub.restore()
    })

    describe('when the sessionId cookie exists', () => {
      it('returns the cookie', () => {
        getSessionIdStub = sinon.stub(userJourney, 'getSessionId').returns('21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3')
        setSessionIdStub = sinon.stub(userJourney, 'setSessionId')
        const req = { cookies: null }
        const res = {}

        const sessionId = userJourney.readOrCreateSessionId(req, res)

        expect(getSessionIdStub.calledOnce).to.be.true
        expect(getSessionIdStub.calledWith(req, res)).to.be.true
        expect(setSessionIdStub.calledOnce).to.be.false
        expect(sessionId).to.equal('21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3')
      })
    })

    describe('when the sessionId cookie does not exist', () => {
      it('sets and returns the cookie', () => {
        getSessionIdStub = sinon.stub(userJourney, 'getSessionId').returns(null)
        setSessionIdStub = sinon.stub(userJourney, 'setSessionId').returns('21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3')
        const req = { cookies: null }
        const res = {}

        const sessionId = userJourney.readOrCreateSessionId(req, res)

        expect(getSessionIdStub.calledOnce).to.be.true
        expect(getSessionIdStub.calledWith(req, res)).to.be.true
        expect(setSessionIdStub.calledOnce).to.be.true
        expect(setSessionIdStub.calledWith(res)).to.be.true
        expect(sessionId).to.equal('21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3')
      })
    })
  })

  describe('#post', () => {
    let requestStub
    let env

    before(() => {
      env = process.env
      process.env = {
        GHBS_WEBHOOK_SECRET: 'secret',
        GHBS_USER_JOURNEY_ENDPOINT: 'endpoint'
      }
    })

    after(() => {
      process.env = env
      requestStub.restore()
    })

    it('sends a post request to the user journey endpoint', () => {
      const https = require('https')
      requestStub = sinon.stub(https, 'request').returns({
        on() {},
        write() {},
        end() {}
      })
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': 23,
          'Authorization': 'Token secret'
        }
      }

      userJourney.post({ testData: 'testData' })

      expect(requestStub.calledOnce).to.be.true
      expect(requestStub.calledWith('endpoint', options, sinon.match.any)).to.be.true
    })
  })

  describe('#recordStep', () => {
    var readOrCreateSessionId
    var post

    afterEach(() => {
      readOrCreateSessionId.restore()
      post.restore()
    })

    it('sets the user journey payload and posts it', () => {
      readOrCreateSessionId = sinon.stub(userJourney, 'readOrCreateSessionId').returns('21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3')
      post = sinon.stub(userJourney, 'post')
      const req = {
        originalUrl: 'testUrl',
        query: { referral_campaign: 'testCampaign' }
      }
      const res = {}
      const payload = {
        sessionId: '21e9fe4a-a575-45f5-9a75-fc92dbfd1dc3',
        productSection: 'faf',
        stepDescription: 'testUrl',
        referralCampaign: 'testCampaign'
      }

      userJourney.recordStep(req, res)

      expect(readOrCreateSessionId.calledOnce).to.be.true
      expect(readOrCreateSessionId.calledWith(req, res)).to.be.true
      expect(post.calledOnce).to.be.true
      expect(post.calledWith(payload)).to.be.true
    })
  })
})
