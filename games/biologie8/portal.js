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
    // XP analog zu chemie8 (~12 pro Entdeckung), damit das Lehrer-Level passt.
    return { deck: deck, coins: coins, xp: deck.length * 12 };
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

  // Präsenz-Heartbeat: meldet regelmäßig „online" fürs Live-Ranking der Lehrkraft.
  // Antwort 403 wrong-game = die Lehrkraft hat ein neues Spiel zugewiesen.
  function heartbeat() {
    try {
      fetch('/api/presence', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ident.code, name: ident.name, game: GAME, pw: ident.pw || '' })
      }).then(function (r) {
        if (r.status === 403) r.json().then(function (j) {
          if (j && j.error === 'wrong-game' && j.game && j.game !== GAME) offerGameSwitch(j.game);
        }, function () {});
      }).catch(function () {});
    } catch (e) {}
  }

  // Pop-up, wenn die Lehrkraft live ein anderes Spiel zuweist.
  var switchShown = false;
  function gameTitleOf(id, cb) {
    fetch('/api/games').then(function (r) { return r.json(); }).then(function (d) {
      var g = (d.games || []).find(function (x) { return x.id === id; });
      cb(g && g.title ? g.title : id);
    }).catch(function () { cb(id); });
  }
  function ensureSwitchCss() {
    if (document.getElementById('gsCss')) return;
    var s = document.createElement('style'); s.id = 'gsCss';
    s.textContent = '#gameSwitch{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(15,20,40,.6);backdrop-filter:blur(4px);padding:18px}#gameSwitch.show{display:flex}.gs-box{background:#fff;color:#1d2f43;max-width:380px;width:100%;border-radius:20px;padding:24px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.35);font-family:system-ui,-apple-system,Segoe UI,sans-serif;animation:gsPop .3s ease-out}@keyframes gsPop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}.gs-emoji{font-size:3rem;line-height:1}.gs-box h2{margin:8px 0 8px;font-size:1.3rem}.gs-box p{margin:6px 0;line-height:1.5;color:#3a4a5e}.gs-actions{display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap}.gs-actions button{font:inherit;font-weight:800;border:0;border-radius:12px;padding:12px 18px;cursor:pointer}.gs-go{background:linear-gradient(135deg,#0a7fa8,#3dc8d8);color:#fff}.gs-stay{background:#eef3f9;color:#3a4a5e}';
    document.head.appendChild(s);
  }
  function offerGameSwitch(newGame) {
    if (switchShown) return; switchShown = true;
    ensureSwitchCss();
    gameTitleOf(newGame, function (title) {
      var o = document.getElementById('gameSwitch');
      if (!o) { o = document.createElement('div'); o.id = 'gameSwitch'; document.body.appendChild(o); }
      o.innerHTML = '<div class="gs-box"><div class="gs-emoji">🎮</div><h2>Neues Spiel!</h2><p>Deine Lehrkraft hat ein neues Spiel zugewiesen:<br><b>' + String(title).replace(/[&<>]/g, '') + '</b></p><p>Willst du jetzt in das neue Spiel wechseln?</p><div class="gs-actions"><button class="gs-go">🚀 Jetzt wechseln</button><button class="gs-stay">Später</button></div></div>';
      o.className = 'show';
      o.querySelector('.gs-go').onclick = function () {
        try { var id = JSON.parse(localStorage.getItem(IDENT) || '{}'); id.game = newGame; localStorage.setItem(IDENT, JSON.stringify(id)); } catch (e) {}
        location.href = '/games/' + encodeURIComponent(newGame) + '/';
      };
      o.querySelector('.gs-stay').onclick = function () { o.className = ''; switchShown = false; };
    });
  }

  heartbeat();
  setInterval(heartbeat, 20000);

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
    var done = function () { syncing = false; sessionStorage.setItem('bio8-hydrated-for', who); show(); };
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
          if (res.j.state && Array.isArray(res.j.state.deck)) writeState(res.j.state);
          else { localStorage.removeItem(S_KEY); localStorage.removeItem(COIN_KEY); } // neuer Account
          sessionStorage.setItem('bio8-hydrated-for', who);
          location.reload();
          return;
        }
        done(); // Server-Fehler/unlesbar → lokal weiterspielen
      })
      .catch(done); // offline → lokal weiterspielen
  }

  // 4) Konto-Anzeige + Abmelden (zurück zum Portal).
  function setupAccount() {
    var stats = document.querySelector('.stats');
    if (!stats) return;
    var el = document.getElementById('accountPill');
    if (!el) {
      el = document.createElement('span');
      el.id = 'accountPill';
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
