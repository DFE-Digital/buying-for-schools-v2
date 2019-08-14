process.env.AUTHUSER = ''
process.env.AUTHPASS = ''
const { server } = require('../../app/index')

const { setWorldConstructor, AfterAll } = require('cucumber')
const { expect } = require('chai')
const puppeteer = require('puppeteer')
const selectors = require('./selectors')

const HOMEPAGE = 'http://localhost:4000'
const serviceName = 'Find a DfE approved framework for your school'

let browser = null
let page = null

class B4SWorld {
  constructor () {
    // console.log('B4SWorld Constructor')
  }

  async gotoPage (u) {
    if (!browser) {
      browser = await puppeteer.launch({ headless: false })
    }

    if (!page) {
      page = await browser.newPage()
    }

    const onPage = await page.goto(HOMEPAGE + u)
  }

  async checkPageContent (data) {
    const results = []
    for (const row of data) {
      const sel = selectors(row[0])
      const txt = await page.evaluate((s) => document.querySelector(s).innerText, sel)
      results.push({ expected: row[1], actual: txt })
    }

    results.forEach(e => {
      expect(e.actual).to.eql(e.expected)
    })
  }

  async checkText (selector, string) {
    // console.log('CheckText', selector, string)
    const txt = await page.evaluate((s) => document.querySelector(s).innerText, selector)
    return expect(txt).to.eql(string)
  }

  async haveRadioButtons (data) {
    const radioGroups = await page.evaluate(() => document.getElementsByClassName('govuk-radios__item').length)
    const results = []
    for (let i = 1; i <= radioGroups; i++) {
      const txt = await page.evaluate((i) => document.querySelector(`.govuk-radios__item:nth-child(${i}) label`).innerText, i)
      const val = await page.evaluate((i) => document.querySelector(`.govuk-radios__item:nth-child(${i}) input`).value, i)
      results.push({ label: txt, value: val })
    }

    data.forEach((row, i) => {
      expect(results[i].label).to.eql(row[0])
      expect(results[i].value).to.eql(row[1])
    })

    // console.log('radioGroups', radioGroups, results)
    return results
  }

  async haveLinks (data) {
    const links = await page.evaluate(() => {
      const links = []
      const elements = document.getElementsByTagName('a')
      for (const element of elements) {
        links.push({ href: element.href, text: element.innerText.replace(/\n/g, ' ') })
      }
      return links
    })

    data.forEach(row => {
      const href = (row[1].substr(0, 4) === 'http') ? row[1] : HOMEPAGE + row[1]
      const text = row[0]
      expect(links).to.deep.include({ text, href })
    })
  }

  async haveResultCard (data) {
    const cards = await page.evaluate(() => {
      const cards = []
      const elements = document.getElementsByClassName('card')
      for (const element of elements) {
        const href = element.querySelector('a').href
        const title = element.querySelector('.card__title').innerText
        const provider = element.querySelector('.card__content dd').innerText
        cards.push({ href, title, provider })
      }
      return cards
    })

    const title = data[0][0]
    const provider = data[1][0]
    const href = (data[2][0].substr(0, 4) === 'http') ? data[2][0] : HOMEPAGE + data[2][0]

    expect(cards).to.deep.include({ href, title, provider })
  }

  async hasPageTitle (pageTitle) {
    return await this.checkText(selectors('page title'), `${pageTitle} - ${serviceName} - GOV.UK`)
  }
}

AfterAll(async function () {
  await browser.close()
  await server.close()
})

setWorldConstructor(B4SWorld)
