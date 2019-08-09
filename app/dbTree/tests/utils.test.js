const chai = require('chai')
const expect = chai.expect
const utils = require('../utils')

const testStructure = require('./data/structure.json')

describe('utils', () => {
  describe('sortBy', () => {
    it('should be able to sort an array of objects by passing a function to get the value to be assessed', () => {
      const arr = [{ val: 'a' }, { val: 'e' }, { val: 'd' }, { val: 'b' }, { val: 'c' }, { val: 'c' }]
      const sorted = utils.sortBy(arr, i => i.val)
      expect(sorted[0].val).to.equal('a')
      expect(sorted[1].val).to.equal('b')
      expect(sorted[2].val).to.equal('c')
      expect(sorted[3].val).to.equal('c')
      expect(sorted[4].val).to.equal('d')
      expect(sorted[5].val).to.equal('e')
    })

    it('should be able to sort an array of scalars by passing getter function', () => {
      const arr = ['e', 'c', 'a', 'b', 'd']
      const sorted = utils.sortBy(arr, i => i)
      expect(sorted.join('')).to.equal('abcde')
    })

    it('should not changed the order of the original array', () => {
      const arr = ['e', 'c', 'a', 'b', 'd']
      const sorted = utils.sortBy(arr, i => i)
      expect(arr.join('')).to.equal('ecabd')
    })
  })

  describe('getQuestionAnswerPairSlugs', () => {
    it('should separate url paths into pairs of question and answer slugs', () => {
      const fruits = utils.getQuestionAnswerPairSlugs('a/apple/b/banana/c/cherry')
      expect(fruits).to.deep.equal([
        ['a', 'apple'],
        ['b', 'banana'],
        ['c', 'cherry']
      ])
    })

    it('should return array of 1 item if the last pair is not complete', () => {
      const music = utils.getQuestionAnswerPairSlugs('band/queen/album/night-at-opera/song/')
      expect(music).to.deep.equal([
        ['band', 'queen'],
        ['album', 'night-at-opera'],
        ['song']
      ])

      const qa = utils.getQuestionAnswerPairSlugs('/q1/a1/q2/')
      expect(qa).to.deep.equal([
        ['q1', 'a1'],
        ['q2']
      ])

      const slashed = utils.getQuestionAnswerPairSlugs('/type/')
      expect(slashed).to.deep.equal([
        ['type']
      ])
    })

    it('should default if the url is blank', () => {
      const blankSlash = utils.getQuestionAnswerPairSlugs('/')
      expect(blankSlash).to.deep.equal([])
    })
  })

  describe('getPair', () => {
    it('should load the questions and corresponding answer from the given doc', () => {
      const pair = utils.getPair(testStructure, ['type', 'buying'])
      expect(pair.question).to.deep.equal(testStructure.question[0])
      expect(pair.answer).to.deep.equal(testStructure.question[0].options[0])
    })

    it('should return null if option chosen does not exist', () => {
      const pair = utils.getPair(testStructure, ['class-library'])
      expect(pair.question).to.deep.equal(testStructure.question[2])
      expect(pair.answer).to.equal(undefined)
    })
  })

  describe('getQuestionAnswerSummary', () => {
    it('should a summary object in a format suitable for GDS summary template', () => {
      const pairs = [['type', 'buying'], ['what', 'books-media']]
      const pairDetail = pairs.map(p => utils.getPair(testStructure, p))
      const summ = utils.getQuestionAnswerSummary(pairDetail, '/root')
      expect(summ).to.be.an('array')
      expect(summ.length).to.equal(2)
      expect(summ[0]).to.deep.equal({
        key: {
          text: 'What are you buying?'
        },
        value: {
          text: 'Goods'
        },
        actions: {
          items: [
            {
              href: '/root/type',
              text: 'Change',
              visuallyHiddenText: 'What are you buying?'
            }
          ]
        }
      })
    })
  })

  describe('getProviderFull', () => {
    it('should get a complete provider name and initials', () => {
      const testProvider = {
        initials: 'ESPO',
        title: 'Eastern Shires Purchasing Organisation'
      }
      expect(utils.getProviderFull(testProvider)).to.equal('Eastern Shires Purchasing Organisation (ESPO)')
    })

    it('should just return the title if the initials are blank', () => {
      const testProvider = {
        title: 'Eastern Shires Purchasing Organisation'
      }
      expect(utils.getProviderFull(testProvider)).to.equal('Eastern Shires Purchasing Organisation')
    })
  })

  describe('getProviderShort', () => {
    it('should return just the initials', () => {
      const testProvider = {
        initials: 'ESPO',
        title: 'Eastern Shires Purchasing Organisation'
      }
      expect(utils.getProviderShort(testProvider)).to.equal('ESPO')
    })

    it('should return just the title if there are no initials', () => {
      const testProvider = {
        initials: '',
        title: 'Eastern Shires Purchasing Organisation'
      }
      expect(utils.getProviderShort(testProvider)).to.equal('Eastern Shires Purchasing Organisation')
    })
  })
})
