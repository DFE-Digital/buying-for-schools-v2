const list = [
  {
    interruptPath: '/find/type/on-going/services-categories/energy',
    template: 'interruptions/rising-energy-prices.njk',
    redirectPath: '/interruptions/rising-energy-prices'
  }
]

const getInterruptionPath = (path) => {
  const found = list.find(interruptPage => interruptPage.interruptPath === path);

  if (found)
    return found.redirectPath
}

module.exports = {
  getInterruptionPath,
  list
}
