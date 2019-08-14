const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
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

    it('should return null if option not chosen', () => {
      const pair = utils.getPair(testStructure, ['class-library'])
      expect(pair.question).to.deep.equal(testStructure.question[2])
      expect(pair.answer).to.equal(null)
    })

    it('should return false if option is invalid', () => {
      const pair = utils.getPair(testStructure, ['class-library', 'fdsafdsa'])
      expect(pair.question).to.deep.equal(testStructure.question[2])
      expect(pair.answer).to.equal(false)
    })

    it('should return a framework if url indicates', () => {
      const pair = utils.getPair(testStructure, ['books'])
      expect(pair.framework).to.deep.equal(testStructure.framework[0])
      expect(pair.question).to.equal(null)
      expect(pair.answer).to.equal(null)
    })
  })

  describe('getPairDetail', () => {
    it('should map pairs to getPair', () => {
      const details = utils.getPairDetail(testStructure, [['type', 'buying'], ['what', 'books-media']])
      expect(details[0]).to.have.property('question')
      expect(details[0].question).to.have.property('ref', 'type')
      expect(details[0].answer).to.have.property('ref', 'buying')
      expect(details[1]).to.have.property('question')
      expect(details[1].question).to.have.property('ref', 'what')
      expect(details[1].answer).to.have.property('ref', 'books-media')
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

    it('should a summary object in a format suitable for GDS summary template', () => {
      const pairs = [['type', 'buying'], ['what', 'books-media'], ['class-library', 'classroom'], ['books']]
      const pairDetail = pairs.map(p => utils.getPair(testStructure, p))
      const summ = utils.getQuestionAnswerSummary(pairDetail, '/root')
      expect(summ).to.be.an('array')
      expect(summ.length).to.equal(3)
      expect(summ[2]).to.deep.equal({
        key: {
          text: 'What goods are you looking for in books and related materials?'
        },
        value: {
          text: 'Classroom supplies'
        },
        actions: {
          items: [
            {
              href: '/root/type/buying/what/books-media/class-library',
              text: 'Change',
              visuallyHiddenText: 'What goods are you looking for in books and related materials?'
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

  describe('confirmQuestionLeadsToNext', () => {
    it('should be able to confirm a link between an answer and question', () => {
      expect(utils.confirmQuestionLeadsToNext({
        question: { _id: 'monday' },
        answer: { next: 'tuesday' }
      }, {
        question: { _id: 'tuesday' }
      })).to.be.true
    })

    it('should be able to confirm a link between an answer and framework', () => {
      expect(utils.confirmQuestionLeadsToNext({
        question: { _id: 'saturday' },
        answer: { result: ['sport', 'tv', 'hobbies'] }
      }, {
        framework: { _id: 'tv' }
      })).to.be.true
    })

    it('should return false if no link between answer and question', () => {
      expect(utils.confirmQuestionLeadsToNext({
        question: { _id: 'monday' },
        answer: { next: 'tuesday' }
      }, {
        question: { _id: 'wednesday' }
      })).to.be.false
    })

    it('should return false if no link between answer and framework', () => {
      expect(utils.confirmQuestionLeadsToNext({
        question: { _id: 'saturday' },
        answer: { result: ['sport', 'tv', 'hobbies'] }
      }, {
        framework: { _id: 'work' }
      })).to.be.false
    })
  })

  describe('validatePairChain', () => {
    describe('should validate a chain of pair details', () => {
      it('that end with an answered question', () => {
        const testDetails = [
          {
            question: { _id: 'dog' },
            answer: { next: 'cat' }
          },
          {
            question: { _id: 'cat' },
            answer: { next: 'mouse' }
          },
          {
            question: { _id: 'mouse' },
            answer: { result: ['bread'] }
          }
        ]
        expect(utils.validatePairChain(testDetails)).to.be.true
      })

      it('that end with an answered question leading to another question', () => {
        const testDetails = [
          {
            question: { _id: 'dog' },
            answer: { next: 'cat' }
          },
          {
            question: { _id: 'cat' },
            answer: { next: 'mouse' }
          }
        ]
        expect(utils.validatePairChain(testDetails)).to.be.true
      })

      it('that end with a framework', () => {
        const testDetails = [
          {
            question: { _id: 'dog' },
            answer: { next: 'cat' }
          },
          {
            question: { _id: 'cat' },
            answer: { next: 'mouse' }
          },
          {
            question: { _id: 'mouse' },
            answer: { result: ['bread'] }
          },
          {
            framework: { _id: 'bread' }
          }
        ]
        expect(utils.validatePairChain(testDetails)).to.be.true
      })

      it('that end with an unanswered question', () => {
        const testDetails = [
          {
            question: { _id: 'dog' },
            answer: { next: 'cat' }
          },
          {
            question: { _id: 'cat' },
            answer: { next: 'mouse' }
          },
          {
            question: { _id: 'mouse' },
            answer: null
          }
        ]
        expect(utils.validatePairChain(testDetails)).to.be.true
      })
    })

    describe('should return false when chain validation fails', () => {
      it('when question does not link to the next question', () => {
        const testDetails = [
          {
            question: { _id: 'dog' },
            answer: { next: 'cat' }
          },
          {
            question: { _id: 'mouse' },
            answer: { result: ['bread'] }
          }
        ]
        expect(utils.validatePairChain(testDetails)).to.be.false
      })

      it('when framework does not match given answer', () => {
        const testDetails = [
          {
            question: { _id: 'dog' },
            answer: { next: 'cat' }
          },
          {
            question: { _id: 'cat' },
            answer: { next: 'mouse' }
          },
          {
            question: { _id: 'mouse' },
            answer: { result: ['bread'] }
          },
          {
            framework: { _id: 'pedigreechum' }
          }
        ]
        expect(utils.validatePairChain(testDetails)).to.be.false
      })

      it('when framework is not at the end of the chain', () => {
        const testDetails = [
          {
            question: { _id: 'dog' },
            answer: { next: 'cat' }
          },
          {
            question: { _id: 'cat' },
            answer: { next: 'mouse' }
          },
          {
            framework: { _id: 'bread' }
          },
          {
            question: { _id: 'mouse' },
            answer: { result: ['bread'] }
          }
        ]
        expect(utils.validatePairChain(testDetails)).to.be.false
      })

      it('when a mid chain question is not answered', () => {
        const testDetails = [
          {
            question: { _id: 'dog' },
            answer: { next: 'cat' }
          },
          {
            question: { _id: 'cat' },
            answer: null
          },
          {
            question: { _id: 'mouse' },
            answer: { result: ['bread'] }
          },
          {
            framework: { _id: 'bread' }
          }
        ]
        expect(utils.validatePairChain(testDetails)).to.be.false
      })

      it('when a mid chain question does not exist', () => {
        const testDetails = [
          {
            question: { _id: 'dog' },
            answer: { next: 'cat' }
          },
          {
            question: null,
            answer: null
          },
          {
            question: { _id: 'mouse' },
            answer: { result: ['bread'] }
          },
          {
            framework: { _id: 'bread' }
          }
        ]
        expect(utils.validatePairChain(testDetails)).to.be.false
      })

      it('when a mid chain question does not exist', () => {
        const testDetails = [
          {
            question: { _id: 'dog' },
            answer: { next: 'cat' }
          },
          {
            question: { _id: 'cat' },
            answer: false
          },
          {
            question: { _id: 'mouse' },
            answer: { result: ['bread'] }
          },
          {
            framework: { _id: 'bread' }
          }
        ]
        expect(utils.validatePairChain(testDetails)).to.be.false
      })
    })

    describe('populateFramework', () => {
      let populatedFramework
      before(() => {
        populatedFramework = utils.populateFramework(testStructure, testStructure.framework[0])
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
})
