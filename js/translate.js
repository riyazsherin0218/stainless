/* ============================================================
   THE STAINLESS (INDIA) — Language switcher
   A custom flag dropdown that drives the Google Website Translator.
   The Google widget itself stays out of sight; this file owns the UI.

   How it works
   ------------
   1. The hidden Google widget renders a <select class="goog-te-combo">.
   2. Picking a language sets that select and fires a "change" event —
      Google then rewrites every visible string on the page, in place.
      No page reload, so it also works when the site is opened straight
      from disk (file:///...), where cookies are not available.
   3. The choice is remembered (localStorage + the googtrans cookie) and
      re-applied automatically on every other page of the site.

   To add / remove a language: edit LANGS below.
     code — Google Translate language code
     cc   — flag country code (needs a .fi-<cc> rule in css/flags.css)
     name — label shown in the dropdown, in that language
   ============================================================ */
(function () {
  'use strict';

  var LANGS = [
    { code: 'en',    cc: 'gb', name: 'English' },
    /* --- India & neighbours --- */
    { code: 'hi',    cc: 'in', name: 'हिन्दी' },
    { code: 'ta',    cc: 'in', name: 'தமிழ்' },
    { code: 'te',    cc: 'in', name: 'తెలుగు' },
    { code: 'ml',    cc: 'in', name: 'മലയാളം' },
    { code: 'kn',    cc: 'in', name: 'ಕನ್ನಡ' },
    { code: 'gu',    cc: 'in', name: 'ગુજરાતી' },
    { code: 'mr',    cc: 'in', name: 'मराठी' },
    { code: 'pa',    cc: 'in', name: 'ਪੰਜਾਬੀ' },
    { code: 'bn',    cc: 'bd', name: 'বাংলা' },
    { code: 'ur',    cc: 'pk', name: 'اردو' },
    { code: 'ne',    cc: 'np', name: 'नेपाली' },
    { code: 'si',    cc: 'lk', name: 'සිංහල' },
    /* --- Middle East & Africa --- */
    { code: 'ar',    cc: 'ae', name: 'العربية' },
    { code: 'iw',    cc: 'il', name: 'עברית' },
    { code: 'fa',    cc: 'ir', name: 'فارسی' },
    { code: 'tr',    cc: 'tr', name: 'Türkçe' },
    { code: 'sw',    cc: 'ke', name: 'Kiswahili' },
    { code: 'af',    cc: 'za', name: 'Afrikaans' },
    { code: 'am',    cc: 'et', name: 'አማርኛ' },
    /* --- East & South-East Asia --- */
    { code: 'zh-CN', cc: 'cn', name: '简体中文' },
    { code: 'zh-TW', cc: 'tw', name: '繁體中文' },
    { code: 'ja',    cc: 'jp', name: '日本語' },
    { code: 'ko',    cc: 'kr', name: '한국어' },
    { code: 'vi',    cc: 'vn', name: 'Tiếng Việt' },
    { code: 'th',    cc: 'th', name: 'ไทย' },
    { code: 'id',    cc: 'id', name: 'Bahasa Indonesia' },
    { code: 'ms',    cc: 'my', name: 'Bahasa Melayu' },
    { code: 'tl',    cc: 'ph', name: 'Filipino' },
    { code: 'my',    cc: 'mm', name: 'မြန်မာ' },
    { code: 'km',    cc: 'kh', name: 'ខ្មែរ' },
    /* --- Europe --- */
    { code: 'de',    cc: 'de', name: 'Deutsch' },
    { code: 'fr',    cc: 'fr', name: 'Français' },
    { code: 'es',    cc: 'es', name: 'Español' },
    { code: 'it',    cc: 'it', name: 'Italiano' },
    { code: 'pt',    cc: 'pt', name: 'Português' },
    { code: 'nl',    cc: 'nl', name: 'Nederlands' },
    { code: 'pl',    cc: 'pl', name: 'Polski' },
    { code: 'ru',    cc: 'ru', name: 'Русский' },
    { code: 'uk',    cc: 'ua', name: 'Українська' },
    { code: 'ro',    cc: 'ro', name: 'Română' },
    { code: 'el',    cc: 'gr', name: 'Ελληνικά' },
    { code: 'cs',    cc: 'cz', name: 'Čeština' },
    { code: 'hu',    cc: 'hu', name: 'Magyar' },
    { code: 'sv',    cc: 'se', name: 'Svenska' },
    { code: 'da',    cc: 'dk', name: 'Dansk' },
    { code: 'no',    cc: 'no', name: 'Norsk' },
    { code: 'fi',    cc: 'fi', name: 'Suomi' },
    { code: 'bg',    cc: 'bg', name: 'Български' }
  ];

  var RTL      = { ar: 1, iw: 1, fa: 1, ur: 1 };
  var STORE    = 'tsi-lang';
  var WAIT_MS  = 15000;   /* how long to wait for Google to come online */
  var POLL_MS  = 120;

  var switchers = [];     /* every rendered dropdown, so all stay in sync */

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function byCode(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return LANGS[0];
  }

  function isKnown(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return true;
    return false;
  }

  function readStore() {
    try { return localStorage.getItem(STORE); } catch (e) { return null; }
  }

  function writeStore(code) {
    try { localStorage.setItem(STORE, code); } catch (e) {}
  }

  function readCookieLang() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    if (!m) return null;
    var parts = decodeURIComponent(m[1]).split('/');
    return parts[2] || null;
  }

  /* The language the page should currently be in. */
  function currentLang() {
    var code = readCookieLang() || readStore() || 'en';
    return isKnown(code) ? code : 'en';
  }

  function cookieHosts() {
    var host = location.hostname;
    var list = [''];                       /* no domain — current host only */
    if (host && host.indexOf('.') > -1 && !/^\d+(\.\d+){3}$/.test(host)) {
      list.push(';domain=' + host);
      list.push(';domain=.' + host);
    }
    return list;
  }

  function writeCookie(value) {
    cookieHosts().forEach(function (d) {
      try { document.cookie = 'googtrans=' + value + ';path=/' + d; } catch (e) {}
    });
  }

  function clearCookie() {
    var expired = ';expires=Thu, 01 Jan 1970 00:00:00 GMT';
    cookieHosts().forEach(function (d) {
      try { document.cookie = 'googtrans=;path=/' + d + expired; } catch (e) {}
    });
  }

  function fire(el, type) {
    var ev;
    try {
      ev = new Event(type, { bubbles: true });
    } catch (e) {                          /* very old browsers */
      ev = document.createEvent('HTMLEvents');
      ev.initEvent(type, true, true);
    }
    el.dispatchEvent(ev);
  }

  /* Waits for Google's hidden <select> to exist and be populated. */
  function withCombo(cb) {
    var started = Date.now();
    (function poll() {
      var combo = document.querySelector('.goog-te-combo');
      if (combo && combo.options && combo.options.length > 1) return cb(combo);
      if (Date.now() - started > WAIT_MS) return cb(null);
      setTimeout(poll, POLL_MS);
    })();
  }

  /* ------------------------------------------------------------------
     Applying a language
     ------------------------------------------------------------------ */
  function setDirection(code) {
    document.documentElement.setAttribute('dir', RTL[code] ? 'rtl' : 'ltr');
  }

  function setBusy(on) {
    switchers.forEach(function (s) { s.root.classList.toggle('is-busy', !!on); });
  }

  var toastTimer = null;
  function setFailed(on) {
    switchers.forEach(function (s) { s.root.classList.toggle('is-failed', !!on); });
    if (!on) return;
    /* the panel is closed by the time this fires, so say it out loud too */
    switchers.forEach(function (s) { s.root.classList.add('show-toast'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      switchers.forEach(function (s) { s.root.classList.remove('show-toast'); });
    }, 7000);
  }

  function refreshButtons(code) {
    var lang = byCode(code);
    switchers.forEach(function (s) {
      s.flag.className = 'fi fi-' + lang.cc;
      s.label.textContent = lang.name;
      s.grid.querySelectorAll('.lang-item').forEach(function (item) {
        item.classList.toggle('is-active', item.getAttribute('data-lang') === code);
      });
    });
  }

  /* Push a non-English language into the Google widget. */
  function translateTo(code, interactive) {
    if (interactive) setBusy(true);
    withCombo(function (combo) {
      setBusy(false);
      if (!combo) { setFailed(true); return; }
      setFailed(false);
      if (combo.value !== code) {
        combo.value = code;
        fire(combo, 'change');
      }
      /* Google occasionally needs a second nudge on a cold start. */
      setTimeout(function () {
        var c = document.querySelector('.goog-te-combo');
        if (c && c.value !== code) { c.value = code; fire(c, 'change'); }
      }, 900);
    });
  }

  /* Called when the visitor picks a language from the dropdown. */
  function choose(code) {
    var previous = currentLang();
    writeStore(code);
    refreshButtons(code);
    setDirection(code);

    if (code === 'en') {
      clearCookie();
      /* Reloading is the cleanest way back to the untouched English page. */
      if (previous !== 'en') location.reload();
      return;
    }

    writeCookie('/en/' + code);
    translateTo(code, true);
  }

  /* ------------------------------------------------------------------
     Dropdown UI
     ------------------------------------------------------------------ */
  function buildSwitcher(root) {
    var active = byCode(currentLang());

    /* keep the language names themselves out of Google's hands */
    root.setAttribute('translate', 'no');
    root.classList.add('notranslate');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Choose language');
    btn.innerHTML =
      '<span class="fi fi-' + active.cc + '"></span>' +
      '<span class="lang-btn-name">' + active.name + '</span>' +
      '<span class="lang-caret" aria-hidden="true"></span>';

    var panel = document.createElement('div');
    panel.className = 'lang-panel';
    panel.setAttribute('role', 'menu');

    var head = document.createElement('div');
    head.className = 'lang-panel-head';
    head.innerHTML = '<span>Select Language</span>' +
      '<button type="button" class="lang-close" aria-label="Close">&times;</button>';
    panel.appendChild(head);

    var note = document.createElement('p');
    note.className = 'lang-note';
    note.textContent = 'Translation service could not be reached. Please check your internet connection and try again.';
    panel.appendChild(note);

    var toast = document.createElement('div');
    toast.className = 'lang-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = 'Translation service unavailable — check your internet connection.';

    var grid = document.createElement('div');
    grid.className = 'lang-grid';
    LANGS.forEach(function (l) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'lang-item' + (l.code === active.code ? ' is-active' : '');
      item.setAttribute('role', 'menuitem');
      item.setAttribute('data-lang', l.code);
      item.setAttribute('lang', l.code);
      item.innerHTML = '<span class="fi fi-' + l.cc + '"></span><span>' + l.name + '</span>';
      item.addEventListener('click', function () {
        close();
        choose(l.code);
      });
      grid.appendChild(item);
    });
    panel.appendChild(grid);

    root.appendChild(btn);
    root.appendChild(panel);
    root.appendChild(toast);

    function close() {
      root.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      var open = root.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    head.querySelector('.lang-close').addEventListener('click', close);
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    switchers.push({
      root:  root,
      btn:   btn,
      flag:  btn.querySelector('.fi'),
      label: btn.querySelector('.lang-btn-name'),
      grid:  grid
    });
  }

  /* ------------------------------------------------------------------
     Google Website Translator — loaded, then kept out of sight
     ------------------------------------------------------------------ */
  window.tsiTranslateInit = function () {
    try {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: LANGS.map(function (l) { return l.code; }).join(','),
        autoDisplay: false
      }, 'google_translate_element');
    } catch (e) {}
  };

  function loadGoogle() {
    if (document.getElementById('tsi-gt-script')) return;
    var s = document.createElement('script');
    s.id = 'tsi-gt-script';
    s.src = 'https://translate.google.com/translate_a/element.js?cb=tsiTranslateInit';
    s.async = true;
    s.onerror = function () { setFailed(true); };
    document.head.appendChild(s);
  }

  /* Google injects a banner iframe and pushes <body> down — undo that. */
  function tidyGoogleChrome() {
    function fix() {
      if (document.body && document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
      if (document.documentElement.style.top) {
        document.documentElement.style.removeProperty('top');
      }
    }
    fix();
    try {
      new MutationObserver(fix).observe(document.documentElement, {
        attributes: true, attributeFilter: ['style'], subtree: true
      });
    } catch (e) {
      setInterval(fix, 500);
    }
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function start() {
    document.querySelectorAll('[data-lang-switcher]').forEach(buildSwitcher);

    var lang = currentLang();
    setDirection(lang);
    refreshButtons(lang);

    loadGoogle();
    tidyGoogleChrome();

    /* Re-apply the saved language on every page of the site. */
    if (lang !== 'en') {
      writeCookie('/en/' + lang);
      translateTo(lang, false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
