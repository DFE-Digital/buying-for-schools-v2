/* global ga */

var doSurvey = document.getElementById('mainscript').getAttribute('data-survey') === 'true'

function getCookie(name) {
  function escape(s) { 
    return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1')
  }
  var match = document.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'))
  return match ? match[1] : null
}

function clearCookie(name) {
  document.cookie = name + "=;Path=/;Expires=Thu, 01 Jan 1970 00:00:00 GMT"
}

function setCookie(name, value) {
  document.cookie = name + '=' + value + ";Path=/;"
}

//## SURVEY ##//

// pre service //

// check the page to see if we need to enforce the pre-service survey
var checkThisPage = function(url) {
  if (url.substr(0, 11) !== '/frameworks') {
    return true
  }
  if (url === '/frameworks/type') {
    return true
  }
  return false
}

var getPreServiceSurveyUrl = function (uid) {
  return 'https://paperstudio.typeform.com/to/fL7D4D?uid=' + uid + '&service_url=' + encodeURI(window.location.href)
}

// if uid is set and page is in scope then set cookie and open the survey url
var uid = getCookie('uid')
if (doSurvey && !uid && checkThisPage(window.location.pathname)) {
  uid = new Date().toISOString() + Math.round(1000 + (Math.random() * 1000))
  setCookie('uid', uid)
  window.location = getPreServiceSurveyUrl(uid)
}


// post service //
var getPostServiceSurveyUrl = function (psbo_url) {
  // { psbo, psbo_url, uid }
  var surveyUrl = 'https://paperstudio.typeform.com/to/z6cuin?'
  surveyUrl += 'uid=' + uid
  surveyUrl += '&psbo_url=' + encodeURI(psbo_url) 
  surveyUrl += '&psbo=' + document.getElementById('supplier').innerHTML
  return surveyUrl
}

// handler for psbo outbound links, track in GA and do post service survey
var getOutboundLink = function(e) {
  e.preventDefault()
  
  var psbo_url = e.target.href
  var url = (uid && doSurvey) ? getPostServiceSurveyUrl(psbo_url) : psbo_url
  clearCookie('uid')

  document.location = url
  return false;
}

// apply outbound link handler to appriopriately classes elements
var externalButtons = document.getElementsByClassName('frameworkbutton--external')
for (var i=0; i<externalButtons.length; i++) {
  externalButtons[i].onclick = getOutboundLink
}


// if the cookie warning has been seen hide the cookie message
var seenCookieMessage = getCookie('seen_cookie_message')
if (seenCookieMessage === 'yes') {
  document.getElementById('global-cookie-message').style.display = 'none'
}
setCookie('seen_cookie_message', 'yes')


