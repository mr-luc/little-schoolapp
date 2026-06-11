// Portal-Anbindung für „Little Algorithmen 7 – Rette Roboter Algo" (games/algorithmen7/).
// - Login kommt vom Portal: ident aus localStorage, sonst Redirect auf /.
// - Synchronisiert den Fortschritt (reparierte Missionen + Energie) mit
//   /api/progress?game=algorithmen7, damit die Lehrkraft ihn sieht und er
//   geräteübergreifend gilt.
// Das Spiel speichert lokal { index, score }. Der Server kennt nur das
// einheitliche Schema { deck, coins, xp }, daher wird hin- und zurückgemappt:
//   index  -> deck = ['m1'..'m<index>']  (Spalte „Begriffe" = reparierte Missionen)
//   score  -> coins                       (Spalte „Münzen"   = gesammelte Energie ⚡)
//   index  -> xp = index * 12             (Level analog zu den anderen Spielen)
// Wird als ERSTES Skript geladen (vor script.js), damit der Sync greift.
(function () {
  // Testmodus (Lehrer-Bereich): ohne Anmeldung, ohne Sync – nur lokal spielen.
  if (new URLSearchParams(location.search).get('test') === '1') {
    function note() {
      var d = document.createElement('div');
      d.textContent = '🧪 Testmodus – Fortschritt wird nicht gespeichert';
      d.style.cssText = 'position:fixed;bottom:8px;right:8px;background:#0f172a;color:#fff;padding:6px 10px;border-radius:10px;font:600 12px system-ui;z-index:9999;opacity:.92';
      document.body.appendChild(d);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', note);
    else note();
    return;
  }

  var IDENT = 'schoolapp-ident-v1', GAME = 'algorithmen7';
  var S_KEY = 'little-algorithmen7-progress-v3';
  var MAX_MISSIONS = 50; // Sicherheits-Clamp; das Spiel begrenzt selbst auf missions.length.

  function getIdent() { try { return JSON.parse(localStorage.getItem(IDENT) || 'null'); } catch (e) { return null; } }
  function hide() { try { document.documentElement.style.visibility = 'hidden'; } catch (e) {} }
  function show() { try { document.documentElement.style.visibility = ''; } catch (e) {} }

  var ident = getIdent();
  // 1) Login-Gating: ohne gültige Anmeldung zurück zum Portal.
  if (!ident || !ident.code || !ident.name) { hide(); location.href = '/'; return; }

  // Lokalen Spielstand { index, score } einlesen und ins Server-Schema mappen.
  function readState() {
    var index = 0, score = 0;
    try {
      var raw = JSON.parse(localStorage.getItem(S_KEY) || 'null');
      if (raw && Number.isInteger(raw.index)) index = Math.max(0, raw.index);
      if (raw && Number.isInteger(raw.score)) score = Math.max(0, raw.score);
    } catch (e) {}
    var deck = [];
    for (var i = 1; i <= index && i <= MAX_MISSIONS; i++) deck.push('m' + i);
    return { deck: deck, coins: score, xp: index * 12 };
  }
  // Server-Schema -> lokales Spielformat { index, score } zurückschreiben.
  function writeState(st) {
    if (!st || !Array.isArray(st.deck)) return;
    var index = Math.min(st.deck.length, MAX_MISSIONS);
    var score = Number.isFinite(st.coins) ? Math.max(0, st.coins | 0) : index;
    origSet(S_KEY, JSON.stringify({ index: index, score: score }));
  }

  // 2) Push (debounced) – jede Spielstand-Änderung wird hochgeladen.
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
      if (key === S_KEY) schedulePush();
    };
  } catch (e) {}

  // 3) Hydration: Serverstand laden, lokal schreiben, einmal neu laden –
  //    je Anmeldung (ident) genau einmal pro Tab-Sitzung.
  var who = ident.code + '|' + ident.name;
  if (sessionStorage.getItem('algo7-hydrated-for') !== who) {
    syncing = true;            // Schreibvorgänge der Hydration nicht zurückpushen
    hide();
    var done = function () { syncing = false; sessionStorage.setItem('algo7-hydrated-for', who); show(); };
    fetch('/api/progress?code=' + encodeURIComponent(ident.code) + '&name=' + encodeURIComponent(ident.name) + '&game=' + encodeURIComponent(GAME) + '&pw=' + encodeURIComponent(ident.pw || ''))
      .then(function (r) {
        if (r.status === 403) { location.href = '/'; return null; } // falsches Spiel/Klasse → Portal
        var ok = r.ok;
        return r.json().then(function (j) { return { ok: ok, j: j }; }, function () { return { ok: ok, j: null }; });
      })
      .then(function (res) {
        if (res === null) return; // 403 → navigiert bereits zum Portal
        // Nur eine OK-Antwort mit dem Feld "state" ist autoritativ. Server-Fehler
        // (z. B. 500/kv-not-bound) dürfen den lokalen Stand NICHT löschen.
        if (res.ok && res.j && ('state' in res.j)) {
          if (res.j.state && Array.isArray(res.j.state.deck) && res.j.state.deck.length) writeState(res.j.state);
          else localStorage.removeItem(S_KEY); // neuer Account → frischer Start
          sessionStorage.setItem('algo7-hydrated-for', who);
          location.reload();
          return;
        }
        done(); // Server-Fehler/unlesbar → lokal weiterspielen
      })
      .catch(done); // offline → lokal weiterspielen
  }

  // 4) Konto-Anzeige + Abmelden (zurück zum Portal) als feste Plakette.
  function setupAccount() {
    if (document.getElementById('accountPill')) return;
    var el = document.createElement('button');
    el.id = 'accountPill';
    el.type = 'button';
    el.textContent = '👤 ' + ident.name;
    el.title = 'Klasse: ' + ident.code + ' · tippen zum Abmelden';
    el.style.cssText = 'position:fixed;top:10px;right:10px;z-index:9999;border:0;cursor:pointer;' +
      'padding:8px 12px;border-radius:999px;font:700 13px system-ui;color:#fff;' +
      'background:linear-gradient(135deg,#6366f1,#2563eb);box-shadow:0 4px 14px rgba(37,99,235,.35)';
    el.onclick = function () {
      localStorage.removeItem(IDENT);
      sessionStorage.removeItem('algo7-hydrated-for');
      location.href = '/';
    };
    document.body.appendChild(el);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupAccount);
  else setupAccount();
})();
