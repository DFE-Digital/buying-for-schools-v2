const utils = require("./dbTree/utils");
const nunjucks = require("nunjucks");
const feedback = require("./services/feedback");

const easyToUseRatingRadioOptions = {
  name: "easy_to_use_rating",
  fieldset: {
    legend: {
      text: "The form was easy to use",
      isPageHeading: false,
      classes: "govuk-fieldset__legend--s"
    }
  },
  items: [
    {
      value: "strongly_agree",
      text: "Strongly agree"
    },
    {
      value: "agree",
      text: "Agree"
    },
    {
      value: "neutral",
      text: "Neutral"
    },
    {
      value: "disagree",
      text: "Disagree"
    },
    {
      value: "strongly_disagree",
      text: "Strongly disagree"
    }
  ]
};

const route = (app) => {
  app.get("/feedback/:frameworkRef", (req, res, next) => {
    const db = app.locals.db;
    return db.getRecord().then(doc => {
      const framework = doc.framework.find(f => f.ref === req.params.frameworkRef);

      if (!framework) {
        return next();
      }

      const populatedFramework = utils.populateFramework(doc, framework);

      return res.send(nunjucks.render("feedback/survey.njk", {
        locals: app.locals,
        pageTitle: "Feedback survey",
        providerName: utils.getProviderShort(populatedFramework.provider),
        frameworkUrl: populatedFramework.url,
        skipUrl: `/feedback/skip/${framework.ref}`,
        easyToUseRatingRadioOptions: easyToUseRatingRadioOptions
      }));
    });
  });

  app.post("/feedback/:frameworkRef", (req, res, next) => {
    const db = app.locals.db;
    return db.getRecord().then(doc => {
      const framework = doc.framework.find(f => f.ref === req.params.frameworkRef);

      if (!framework) {
        return next();
      }

      const populatedFramework = utils.populateFramework(doc, framework);

      let err = null;
      if (!req.body.easy_to_use_rating) {
        const errMsg = "Select how strongly you agree that this form was easy to use";
        easyToUseRatingRadioOptions.errorMessage = { text: errMsg };
        err = {
          titleText: "There is a problem",
          errorList: [
            {
              text: errMsg,
              href: `#${easyToUseRatingRadioOptions.name}`
            }
          ]
        };
      }

      if (!err) {
        res.cookie("skipSurvey", true);
        feedback.sendFeedback(req.body, app.locals.db.docStatus);
        return res.redirect(`/feedback/thank-you/${framework.ref}`);
      }

      return res.send(nunjucks.render("feedback/survey.njk", {
        locals: app.locals,
        pageTitle: "Feedback survey",
        providerName: utils.getProviderShort(populatedFramework.provider),
        frameworkUrl: populatedFramework.url,
        skipUrl: `/feedback/skip/${framework.ref}`,
        easyToUseRatingRadioOptions: easyToUseRatingRadioOptions,
        err: err
      }));
    });
  });

  app.get("/feedback/thank-you/:frameworkRef", (req, res, next) => {
    const db = app.locals.db;
    return db.getRecord().then(doc => {
      const framework = doc.framework.find(f => f.ref === req.params.frameworkRef);

      if (!framework) {
        return next();
      }

      const populatedFramework = utils.populateFramework(doc, framework);

      return res.send(nunjucks.render("feedback/thank-you.njk", {
        locals: app.locals,
        pageTitle: "Feedback survey",
        providerName: utils.getProviderShort(populatedFramework.provider),
        frameworkUrl: populatedFramework.url
      }));
    });
  });

  app.get("/feedback/skip/:frameworkRef", (req, res, next) => {
    const db = app.locals.db;
    return db.getRecord().then(doc => {
      const framework = doc.framework.find(f => f.ref === req.params.frameworkRef);

      if (!framework) {
        return next();
      }

      res.cookie("skipSurvey", true);
      return res.redirect(framework.url);
    });
  });
};

module.exports = {
  route
};
