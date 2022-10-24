const crypto = require("crypto");

var service = {
  getSessionId: getSessionId,
  setSessionId: setSessionId,
  readOrCreateSessionId: readOrCreateSessionId,
  post: post,
  recordStep: recordStep
}

module.exports = service

function getSessionId(req, res) {
  return req.cookies.sessionId || res.getHeader("set-cookie")?.match(/sessionId=(.+);/)[1];
}

function setSessionId(res) {
  const sessionId = crypto.randomUUID();
  res.cookie("sessionId", sessionId);
  return sessionId;
}

function readOrCreateSessionId(req, res) {
  var sessionId = service.getSessionId(req, res);
  if (sessionId == null) {
    sessionId = service.setSessionId(res);
  }
  return sessionId;
}

function post(payload) {
  const https = require("https");
  const data = JSON.stringify(payload);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
      "Authorization": `Token ${process.env.GHBS_WEBHOOK_SECRET}`
    }
  };
  
  const req = https.request(process.env.GHBS_USER_JOURNEY_ENDPOINT, options, res => {
    console.log(`statusCode: ${res.statusCode}`);
  });

  req.on("error", error => {
    console.error(error);
  });

  req.write(data);
  req.end();
}

function recordStep(req, res) {
  const payload = {
    sessionId: service.readOrCreateSessionId(req, res),
    productSection: "faf",
    stepDescription: req.originalUrl
  };

  service.post(payload);
}
