// Portal-Anbindung für „Bio-Alchemie" (games/biologie8/).
// - Login kommt vom Portal: ident aus localStorage, sonst Redirect auf /.
// - Synchronisiert den Fortschritt (entdeckte Begriffe + Münzen) mit
//   /api/progress?game=biologie8, damit die Lehrkraft ihn sieht und er
//   geräteübergreifend gilt.
// Wird als ERSTES Skript geladen (vor script2.js), damit der Sync greift.
(function () {
  // Testmodus (Lehrer-Bereich): ohne Anmeldung, ohne Sync – nur lokal spielen.
  if (new URLSearchParams(location.search).get('test') === '1') {
    function note() {
      var d = document.createElement('div');
      d.textContent = '🧪 Testmodus – Fortschritt wird nicht gespeichert';
      d.style.cssText = 'position:fixed;bottom:8px;right:8px;background:#21160f;color:#fff;padding:6px 10px;border-radius:10px;font:600 12px system-ui;z-index:9999;opacity:.92';
      document.body.appendChild(d);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', note);
    else note();
    return;
  }

  var IDENT = 'schoolapp-ident-v1', GAME = 'biologie8';
  var S_KEY = 'little-bio8-progress-v5', COIN_KEY = 'little-bio8-coins-v1';

  function getIdent() { try { return JSON.parse(localStorage.getItem(IDENT) || 'null'); } catch (e) { return null; } }
  function hide() { try { document.documentElement.style.visibility = 'hidden'; } catch (e) {} }
  function show() { try { document.documentElement.style.visibility = ''; } catch (e) {} }

  var ident = getIdent();
  // 1) Login-Gating: ohne gültige Anmeldung zurück zum Portal.
  if (!ident || !ident.code || !ident.name) { hide(); location.href = '/'; return; }

  // Aktuellen Spielstand fürs Hochladen einsammeln (Start-Begriffe ausnehmen).
  function readState() {
    var arr = [];
    try { arr = JSON.parse(localStorage.getItem(S_KEY) || '[]') || []; } catch (e) { arr = []; }
    var start = [];
    try { if (typeof START !== 'undefined' && START && START.length) start = START; } catch (e) {}
    var deck = arr.filter(function (x) { return start.indexOf(x) < 0; });
    var coins = Number(localStorage.getItem(COIN_KEY));
    if (!isFinite(coins)) coins = 5;
    return { deck: deck, coins: coins, xp: deck.length };
  }
  function writeState(st) {
    if (st && Array.isArray(st.deck)) origSet(S_KEY, JSON.stringify(st.deck));
    if (st && isFinite(st.coins)) origSet(COIN_KEY, String(st.coins));
  }

  // 2) Push (debounced) – jede Änderung an Begriffen/Münzen wird hochgeladen.
  var pushTimer = null, syncing = false;
  function push() {
    var st = readState();
    try {
      fetch('/api/progress', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ident.code, name: ident.name, game: GAME, pw: ident.pw || '', state: st })
      });
    } catch (e) {}
  }
  function schedulePush() { if (syncing) return; clearTimeout(pushTimer); pushTimer = setTimeout(push, 800); }

  // localStorage.setItem überwachen, um Spielstand-Schreibvorgänge zu erkennen.
  var origSet = localStorage.setItem.bind(localStorage);
  try {
    localStorage.setItem = function (key, val) {
      origSet(key, val);
      if (key === S_KEY || key === COIN_KEY) schedulePush();
    };
  } catch (e) {}

  // 3) Hydration: Serverstand laden, lokal schreiben, einmal neu laden –
  //    je Anmeldung (ident) genau einmal pro Tab-Sitzung.
  var who = ident.code + '|' + ident.name;
  if (sessionStorage.getItem('bio8-hydrated-for') !== who) {
    syncing = true;            // Schreibvorgänge der Hydration nicht zurückpushen
    hide();
    fetch('/api/progress?code=' + encodeURIComponent(ident.code) + '&name=' + encodeURIComponent(ident.name) + '&game=' + encodeURIComponent(GAME) + '&pw=' + encodeURIComponent(ident.pw || ''))
      .then(function (r) {
        if (r.status === 403) { location.href = '/'; return null; } // falsches Spiel/Klasse → Portal
        return r.json().catch(function () { return null; });
      })
      .then(function (j) {
        if (j === null) return;
        if (j.state && Array.isArray(j.state.deck)) {
          writeState(j.state);
        } else {                // neuer Account: lokal frisch starten
          localStorage.removeItem(S_KEY);
          localStorage.removeItem(COIN_KEY);
        }
        sessionStorage.setItem('bio8-hydrated-for', who);
        location.reload();
      })
      .catch(function () {       // offline: lokal weiterspielen
        sessionStorage.setItem('bio8-hydrated-for', who);
        show();
      });
  }

  // 4) Konto-Anzeige + Abmelden (zurück zum Portal).
  function setupAccount() {
    var stats = document.querySelector('.stats');
    if (!stats) return;
    var el = document.getElementById('accountPill');
    if (!el) {
      el = document.createElement('span');
      el.id = 'accountPill';
      el.setAttribute('id', 'accountPill');
      el.style.cursor = 'pointer';
      el.style.marginLeft = '8px';
      stats.appendChild(el);
    }
    el.textContent = '👤 ' + ident.name;
    el.title = 'Klasse: ' + ident.code + ' · tippen zum Wechseln';
    el.onclick = function () {
      localStorage.removeItem(IDENT);
      sessionStorage.removeItem('bio8-hydrated-for');
      location.href = '/';
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupAccount);
  else setupAccount();
})();
