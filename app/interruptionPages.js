// NOTE: interruption does not "intercept" the request, it replaces the options value in the form for normal submission.
// See: app/dbTree/dbTreeQuestion.js:33

// Example list value:
// {
//   interruptPath: '/find/type/on-going/services-categories/energy', - The original path - if an option value has this path, then it will be replaced
//   redirectPath: '/interruptions/rising-energy-prices',             - Go here instead (routed in "routeInterruptionPages")
//   title: 'What you can do to reduce energy costs'                  - The title of the resulting interruption page
//   template: 'interruptions/rising-energy-prices.njk',              - The template of the resulting interruption page
// }

const list = [
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
