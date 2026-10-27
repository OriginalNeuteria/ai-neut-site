/* Neut School links on the tester page.
   Shows two buttons only when learn.ai-neut.com says this browser is signed in as an APPROVED tester.
   The answer is just {approved, roles}; no email or name ever reaches this page.
   The links grant nothing: learn.ai-neut.com checks the sign-in and the approved list on every request. */
(function () {
  var SCHOOL_NAME = 'Neut School';                 // the one place to rename it
  var LEARN = 'https://learn.ai-neut.com';         // where Neut School lives
  var SHOW_FOR = ['tester', 'owner', 'employee'];
  var box = document.getElementById('nschool'), signin = document.getElementById('nschool-in');
  if (!box || !signin || !window.fetch) return;
  var names = document.querySelectorAll('[data-school-name]');
  for (var i = 0; i < names.length; i++) names[i].textContent = SCHOOL_NAME;
  var here = /^https:\/\/(www\.)?ai-neut\.com$/.test(location.origin) ? location.origin + '/test.html' : 'https://www.ai-neut.com/test.html';
  document.getElementById('nschool-train').href = LEARN + '/training/';
  document.getElementById('nschool-onb').href = LEARN + '/onboarding/';
  signin.querySelector('a').href = LEARN + '/login?next=' + encodeURIComponent(here);
  var ctl = window.AbortController ? new AbortController() : null;
  var t = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
  fetch(LEARN + '/api/tester-status', { credentials: 'include', cache: 'no-store', mode: 'cors', signal: ctl ? ctl.signal : undefined })
    .then(function (r) { return r.ok ? r.json() : { approved: false }; })
    .catch(function () { return { approved: false }; })
    .then(function (s) {
      clearTimeout(t);
      var ok = s && s.approved === true && Array.isArray(s.roles) && s.roles.some(function (r) { return SHOW_FOR.indexOf(r) !== -1; });
      if (ok) box.hidden = false; else signin.hidden = false;
    });
})();
