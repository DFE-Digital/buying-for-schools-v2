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

function setCookieWithExpiry(name, value, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function removeAllCookies(){
  var cookies = document.cookie.split("; ");
  for (var c = 0; c < cookies.length; c++) {
      var d = window.location.hostname.split(".");
      while (d.length > 0) {
          var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
          var p = location.pathname.split('/');
          document.cookie = cookieBase + '/';
          while (p.length > 0) {
              document.cookie = cookieBase + p.join('/');
              p.pop();
          }
          d.shift();
      }
  }
}

function getHostnameFromRegex (url) {
  // run against regex
  var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  // extract hostname (will be null if no match is found)
  return matches && matches[1];
}

window.cookie_acceptance_name = 'cookie_consent';
window.consentCookie = getCookie(cookie_acceptance_name);
window.cookie_consent = false;
if (consentCookie === 'yes') {
  window.cookie_consent = true;
}

// cookie banner
(function(){
  if(document.location.pathname === '/cookies') {
    return;
  }

  var cookieBanner = document.querySelector('.js-cookie-banner');
  var cookieAsk = document.querySelector('.js-cookie-ask');
  var acceptAllCookiesButton = document.querySelector('.js-accept-all-cookies');
  var rejectAllCookiesButton = document.querySelector('.js-reject-all-cookies');

  var cookieAcceptConfirmation = document.querySelector('.js-cookies-accepted');
  var cookieRejectConfirmation = document.querySelector('.js-cookies-rejected');
  var hideBannerButton = document.querySelectorAll('.js-hide-cookie-banner');
  var hideBannerIndex;
  
  function setupBannerClose(idx) {
    hideBannerButton[idx].addEventListener('click', function() {
      cookieBanner.setAttribute('hidden', '');
    });
  }

  if (cookieBanner && !window.consentCookie) {
      cookieBanner.removeAttribute('hidden');
      acceptAllCookiesButton.addEventListener('click', function (event) {
          setCookieWithExpiry(cookie_acceptance_name, 'yes', 365);
          cookieAsk.setAttribute('hidden', '');
          cookieAcceptConfirmation.removeAttribute('hidden');
          if(setGA) {
            setGA();
          }
      }, false);

      rejectAllCookiesButton.addEventListener('click', function (event) {
          setCookieWithExpiry(cookie_acceptance_name, 'no', 365);
          cookieAsk.setAttribute('hidden', '');
          cookieRejectConfirmation.removeAttribute('hidden');
      }, false);

      for (hideBannerIndex = 0; hideBannerIndex < hideBannerButton.length; hideBannerIndex++) {
        setupBannerClose(hideBannerIndex);
      }
  }
}());


// cookie settings page
(function(){
  if (document.location.pathname !== '/cookies') {
    return;
  }

  if (cookie_consent) {
    document.querySelectorAll('input[name="analytics-cookies"]')[0].checked = true;
  }

  var saveSettingsButton = document.querySelector('.js-save-cookie-settings');
  var successMsg = document.querySelector('.js-cookie-success');
  var choices = document.querySelector('.js-cookie-choices');
  
  function success(){
    successMsg.style.display = 'block';
    choices.style.display = 'none';
  }

  successMsg.style.display = 'none';

  saveSettingsButton.addEventListener('click', function (event) {
    var value = document.querySelector('input[name="analytics-cookies"]:checked').value;
    if (value === 'yes') {
      setCookieWithExpiry(cookie_acceptance_name, 'yes', 365);
      if(setGA) {
        setGA();
      }
      success();
    } else {
      removeAllCookies();
      setCookieWithExpiry(cookie_acceptance_name, 'no', 365);
      success();
    }
  }, false);
}());

// back button
(function(){
  var backLink = document.querySelector('.js-back-link');

  if (backLink == null) {
      return;
  }

  // if the referer was the same as this site go back in history
  if (getHostnameFromRegex(window.location.href) === getHostnameFromRegex(document.referrer)) {
      backLink.href = document.referrer;
      backLink.addEventListener('click', function (e) {
          e.preventDefault();
          history.back();
      });
  }
}());


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
var uid;
if(cookie_consent) {
  uid = getCookie('uid')
  if (doSurvey && !uid && checkThisPage(window.location.pathname)) {
    uid = new Date().toISOString() + Math.round(1000 + (Math.random() * 1000))
    setCookie('uid', uid)
    window.location = getPreServiceSurveyUrl(uid)
  }
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
