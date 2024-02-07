const https = require("https");

const service = {
  sendFeedback: sendFeedback
};

module.exports = service;

function sendFeedback(feedback, docStatus) {
  let endpoint = docStatus === "LIVE" ? "https://www.get-help-buying-for-schools.service.gov.uk" : "https://staging.get-help-buying-for-schools.service.gov.uk";
  endpoint = `${endpoint}/end_of_journey_surveys`;

  const data = JSON.stringify({
    easy_to_use_rating: feedback.easy_to_use_rating,
    improvements: feedback.improvements,
    service: "find_a_framework"
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Content-Length": Buffer.byteLength(data),
      "Authorization": `Token ${process.env.GHBS_WEBHOOK_SECRET}`
    }
  };

  const req = https.request(endpoint, options, res => {
    console.log(`Send feedback statusCode: ${res.statusCode}`);
  });

  req.on("error", error => {
    console.error(error);
  });

  req.write(data);
  req.end();
}
