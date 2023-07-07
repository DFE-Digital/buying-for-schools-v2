const route = (app) => {
  const populateFrameworkReferences = (frameworks, categories, providers) => {
    const populatedFrameworks = frameworks.map(f => {
      if (f.cat) {
        const matchingCategory = categories.filter(c => c._id.toString() === f.cat.toString())[0];
        if (matchingCategory) {
          f.cat = JSON.parse(JSON.stringify(matchingCategory));
          delete f.cat._id;
        }
      }
      if (f.provider) {
        const matchingProvider = providers.filter(p => p._id.toString() === f.provider.toString())[0];
        if (matchingProvider) {
          f.provider = JSON.parse(JSON.stringify(matchingProvider));
          delete f.provider._id;
        }
      }
      delete f._id;
      return f;
    })
    return populatedFrameworks;
  };

  app.get("/frameworks", (req, res, next) => {
    const db = app.locals.db;
    db.getRecord().then((doc) => {
      populatedFrameworks = populateFrameworkReferences(doc.framework, doc.category, doc.provider);
      res.send(populatedFrameworks);
    });
  });
};

module.exports = {
  route
};
