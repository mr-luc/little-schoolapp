// Cloudflare Worker (mit statischen Assets) für das Portal „Little-SchoolApp"
// - /api/ping                  Erkennung
// - /api/games                 Liste verfügbarer Spiele (für das Dropdown)
// - /api/progress              Schüler-Sync (pro Klasse + zugewiesenem Spiel)
// - /api/teacher/status        Ist eine Lehrer-PIN eingerichtet?
// - /api/teacher/setup         Lehrer-PIN erstmalig festlegen
// - /api/teacher/login         Lehrer-PIN prüfen
// - /api/teacher/classes       Klassencodes verwalten (GET/POST/DELETE), inkl. Spiel
// - /api/class                 Schülerliste einer Klasse (Lehrer)
// - sonst: statische Dateien (index.html, lehrer.html, games/<game>/ …)
//
// KV-Namespace ist als `PROGRESS` gebunden. Lehrer-PIN als Secret
// `TEACHER_PIN` (oder `Teacher`). Es werden nur Spieldaten gespeichert.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Teacher-Pin,X-Teacher-User',
};

// Verfügbare Spiele. Quelle für /api/games und das Dropdown im Lehrer-Bereich.
const GAMES = [
  { id: 'chemie8', title: 'Little Chemie 8' },
  { id: 'biologie8', title: 'Bio-Alchemie (Biologie 8)' },
  { id: 'informatik7', title: 'Informatik Alchemie (Klasse 7)' },
];
const DEFAULT_GAME = 'chemie8';
const gameAllowed = (g) => GAMES.some((x) => x.id === g);

const norm = (s) => String(s || '').trim().toLowerCase().slice(0, 40);
const valid = (c, n) => norm(c).length >= 1 && norm(n).length >= 1;
const stKey = (c, n, g) => `st:${encodeURIComponent(norm(c))}:${encodeURIComponent(norm(n))}:${encodeURIComponent(norm(g))}`;
const stPrefix = (c) => `st:${encodeURIComponent(norm(c))}:`;
const stSuffix = (g) => `:${encodeURIComponent(norm(g))}`;
const classKey = (c) => `class:${encodeURIComponent(norm(c))}`;
const teacherKey = (u) => `teacher:${encodeURIComponent(norm(u))}`;
const ADMIN_USER = 'admin'; // reservierter Benutzername für die Admin-Rolle
const validUser = (u) => /^[a-z0-9_-]{1,40}$/.test(norm(u)) && norm(u) !== ADMIN_USER;
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

const teacherPinEnv = (env) => env.TEACHER_PIN || env.Teacher || env.TEACHER || env.teacher;
async function resolvePin(env) {
  const e = teacherPinEnv(env);
  if (e) return e;
  try { return (await env.PROGRESS.get('cfg:teacherpin')) || ''; } catch (e2) { return ''; }
}

// Wer ist angemeldet? Admin (Master-PIN) oder ein Lehrer (Benutzername + PIN).
// Liefert { role:'admin'|'teacher', user } oder null bei ungültigen Daten.
async function authCtx(request, env, url) {
  const pin = request.headers.get('X-Teacher-Pin') || url.searchParams.get('pin') || '';
  const user = norm(request.headers.get('X-Teacher-User') || url.searchParams.get('user') || '');
  if (user && user !== ADMIN_USER) {
    const raw = await env.PROGRESS.get(teacherKey(user));
    if (!raw) return null;
    let t; try { t = JSON.parse(raw); } catch (e) { return null; }
    if (!t || !t.pin || pin !== t.pin) return null;
    return { role: 'teacher', user };
  }
  const adminPin = await resolvePin(env);
  if (adminPin && pin === adminPin) return { role: 'admin', user: ADMIN_USER };
  return null;
}
const owns = (ctx, cls) => ctx.role === 'admin' || norm(cls && cls.owner) === ctx.user;

function sanitize(s) {
  if (!s || typeof s !== 'object') return null;
  const deck = Array.isArray(s.deck)
    ? s.deck.filter((x) => typeof x === 'string' && x.length < 40).slice(0, 300)
    : [];
  const coins = Number.isFinite(s.coins) ? Math.max(0, Math.min(1e6, s.coins | 0)) : 0;
  const xp = Number.isFinite(s.xp) ? Math.max(0, Math.min(1e9, s.xp | 0)) : 0;
  return { deck, coins, xp };
}

// Zugewiesenes Spiel einer Klasse (mit Rückfall auf das Standardspiel).
const classGame = (cls) => {
  const g = cls && norm(cls.game);
  return gameAllowed(g) ? g : DEFAULT_GAME;
};

// Pseudonyme Login-Namen erzeugen (eindeutig je Klasse, fortlaufend nummeriert).
const NAMEWORDS = ['Argon', 'Helium', 'Neon', 'Krypton', 'Xenon', 'Eisen', 'Kupfer', 'Zink', 'Gold', 'Silber', 'Natrium', 'Kalium', 'Calcium', 'Magnesium', 'Kohlenstoff', 'Sauerstoff', 'Stickstoff', 'Schwefel', 'Chlor', 'Jod', 'Lithium', 'Nickel', 'Platin', 'Titan', 'Bor', 'Brom', 'Fluor', 'Radon', 'Cobalt', 'Zinn'];
function genSlots(existing, count) {
  const out = [];
  const start = existing.length;
  for (let i = 0; i < count; i++) {
    const idx = start + i;
    const word = NAMEWORDS[idx % NAMEWORDS.length];
    out.push(`${word}-${String(idx + 1).padStart(2, '0')}`);
  }
  return out;
}
// Nur erzeugte Namen zulassen (sofern für die Klasse Slots existieren).
function nameAllowed(clsRaw, name) {
  try {
    const c = JSON.parse(clsRaw);
    if (Array.isArray(c.slots) && c.slots.length) return c.slots.some((s) => norm(s) === norm(name));
    return true;
  } catch (e) { return true; }
}

// Einfache, gut merkbare Passwörter (Wort + zwei Ziffern), z. B. "apfel73".
// Zwei Ziffern → ~3000 Kombinationen pro Name (Brute-Force-Schutz fürs Klassenzimmer).
const PWWORDS = ['apfel', 'banane', 'katze', 'hund', 'baum', 'blume', 'stern', 'mond', 'sonne', 'wolke', 'fisch', 'vogel', 'tiger', 'loewe', 'hase', 'igel', 'biene', 'feder', 'blatt', 'berg', 'fluss', 'insel', 'keks', 'honig', 'kirsche', 'pilz', 'nuss', 'beere', 'wald', 'wiese'];
const genPw = (suffix) => PWWORDS[Math.floor(Math.random() * PWWORDS.length)] + String(10 + Math.floor(Math.random() * 90)) + (suffix || '');
// Passwörter werden case-insensitiv behandelt (Handy-Autokorrektur großschreibt gern).
const normPw = (pw) => String(pw || '').trim().toLowerCase();
// Passwort prüfen: nur erzwingen, wenn für diesen Login eines hinterlegt ist.
function pwOk(cls, name, pw) {
  if (!cls || !cls.pw || typeof cls.pw !== 'object') return true;
  const want = cls.pw[norm(name)];
  if (!want) return true;
  return normPw(pw) === normPw(want);
}

// Index für code-freien Login: (Login-Name + Passwort) → Klassencode.
const lookKey = (name, pw) => `look:${encodeURIComponent(norm(name))}:${encodeURIComponent(normPw(pw))}`;
// Stellt sicher, dass jedes (Name+Passwort)-Paar global eindeutig ist und auf
// diese Klasse zeigt. Bei Kollision mit einer anderen Klasse wird das Passwort
// neu erzeugt. Liefert die (ggf. aktualisierte) Passwort-Map zurück.
async function ensureUniqueLogins(env, code, slots, pw) {
  pw = pw || {};
  for (const name of slots) {
    const n = norm(name);
    let p = pw[n] || genPw();
    let tries = 0;
    while (tries < 60) {
      const owner = await env.PROGRESS.get(lookKey(n, p));
      if (!owner || owner === code) break; // frei oder bereits unsere Klasse
      // Kollision mit fremder Klasse → neues Passwort; nach einigen Versuchen
      // garantiert eindeutiger Zufalls-Suffix, damit nie ein fremder Eintrag
      // überschrieben wird.
      p = genPw(tries > 20 ? '-' + Math.random().toString(36).slice(2, 6) : '');
      tries++;
    }
    pw[n] = p;
    await env.PROGRESS.put(lookKey(n, p), code);
  }
  return pw;
}

async function handleApi(request, env, url) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  const p = url.pathname;

  if (p === '/api/ping') return json({ ok: true, kv: !!env.PROGRESS, teacher: !!(await resolvePin(env)) });

  // Liste der verfügbaren Spiele (für das Dropdown beim Klassen-Anlegen).
  if (p === '/api/games') return json({ games: GAMES });

  // Ist eine Lehrer-PIN eingerichtet? (für die Setup-/Login-Entscheidung)
  if (p === '/api/teacher/status') {
    return json({ configured: !!(await resolvePin(env)), bySecret: !!teacherPinEnv(env) });
  }
  // Lehrer-PIN erstmalig festlegen (oder ändern mit aktueller PIN). Nicht möglich,
  // wenn die PIN über ein Worker-Secret verwaltet wird.
  if (p === '/api/teacher/setup') {
    if (request.method !== 'POST') return json({ error: 'method-not-allowed' }, 405);
    if (!env.PROGRESS) return json({ error: 'kv-not-bound' }, 500);
    if (teacherPinEnv(env)) return json({ error: 'managed-by-secret' }, 409);
    let body;
    try { body = await request.json(); } catch (e) { return json({ error: 'bad-json' }, 400); }
    const newPin = String((body && body.pin) || '').trim();
    if (newPin.length < 4) return json({ error: 'pin-too-short' }, 400);
    const cur = await env.PROGRESS.get('cfg:teacherpin');
    if (cur && String((body && body.current) || '') !== cur) return json({ error: 'unauthorized' }, 401);
    await env.PROGRESS.put('cfg:teacherpin', newPin);
    return json({ ok: true });
  }

  // ---- Schüler-Sync: nur für angelegte Klassencodes + zugewiesenes Spiel ----
  if (p === '/api/progress') {
    if (!env.PROGRESS) return json({ error: 'kv-not-bound' }, 500);
    if (request.method === 'GET') {
      let code = url.searchParams.get('code');
      const name = url.searchParams.get('name');
      const pw = url.searchParams.get('pw');
      const game = url.searchParams.get('game');
      // Code-freier Login: Klasse über (Login-Name + Passwort) auflösen.
      if (!norm(code)) {
        if (!norm(name)) return json({ error: 'bad-params' }, 400);
        const resolved = await env.PROGRESS.get(lookKey(name, pw));
        if (!resolved) return json({ error: 'unknown-login' }, 403);
        code = resolved;
      }
      if (!valid(code, name)) return json({ error: 'bad-params' }, 400);
      const clsRaw = await env.PROGRESS.get(classKey(code));
      if (!clsRaw) return json({ error: 'unknown-class' }, 403);
      if (!nameAllowed(clsRaw, name)) return json({ error: 'unknown-name' }, 403);
      const cls = JSON.parse(clsRaw);
      if (!pwOk(cls, name, pw)) return json({ error: 'bad-pin' }, 403);
      const assigned = classGame(cls);
      // Wird ein Spiel mitgeschickt, muss es zum zugewiesenen Spiel passen.
      if (game && norm(game) !== assigned) return json({ error: 'wrong-game', game: assigned }, 403);
      const raw = await env.PROGRESS.get(stKey(code, name, assigned));
      return json({ state: raw ? JSON.parse(raw) : null, game: assigned, code: norm(code) });
    }
    if (request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: 'bad-json' }, 400); }
      const { code, name, game, pw, state } = body || {};
      if (!valid(code, name)) return json({ error: 'bad-params' }, 400);
      const clsRaw = await env.PROGRESS.get(classKey(code));
      if (!clsRaw) return json({ error: 'unknown-class' }, 403);
      if (!nameAllowed(clsRaw, name)) return json({ error: 'unknown-name' }, 403);
      const cls = JSON.parse(clsRaw);
      if (!pwOk(cls, name, pw)) return json({ error: 'bad-pin' }, 403);
      const assigned = classGame(cls);
      if (game && norm(game) !== assigned) return json({ error: 'wrong-game', game: assigned }, 403);
      const clean = sanitize(state);
      if (!clean) return json({ error: 'bad-state' }, 400);
      await env.PROGRESS.put(stKey(code, name, assigned), JSON.stringify({ ...clean, name: norm(name), game: assigned, updated: Date.now() }));
      return json({ ok: true, game: assigned });
    }
    return json({ error: 'method-not-allowed' }, 405);
  }

  // ---- Ab hier: Lehrer-/Admin-Bereich (Anmeldung nötig) ----
  if (p === '/api/teacher/login' || p === '/api/teacher/classes' || p === '/api/class' || p === '/api/admin/teachers') {
    if (!env.PROGRESS) return json({ error: 'kv-not-bound' }, 500);
    const tp = await resolvePin(env);
    if (!tp) return json({ error: 'teacher-pin-not-configured' }, 503);
    const ctx = await authCtx(request, env, url);
    if (!ctx) return json({ error: 'unauthorized' }, 401);

    if (p === '/api/teacher/login') return json({ ok: true, role: ctx.role, user: ctx.user });

    // ---- Admin: Lehrer-Logins verwalten ----
    if (p === '/api/admin/teachers') {
      if (ctx.role !== 'admin') return json({ error: 'forbidden' }, 403);
      if (request.method === 'GET') {
        // Klassen einmal laden und Eigentümer zählen (statt pro Lehrer neu).
        const cl = await env.PROGRESS.list({ prefix: 'class:' });
        const byOwner = {};
        for (const ck of cl.keys) {
          const cr = await env.PROGRESS.get(ck.name);
          if (!cr) continue;
          let o; try { o = norm(JSON.parse(cr).owner); } catch (e) { continue; }
          if (o) byOwner[o] = (byOwner[o] || 0) + 1;
        }
        const list = await env.PROGRESS.list({ prefix: 'teacher:' });
        const teachers = [];
        for (const k of list.keys) {
          const raw = await env.PROGRESS.get(k.name);
          if (!raw) continue;
          let t; try { t = JSON.parse(raw); } catch (e) { continue; }
          teachers.push({ username: t.username, label: t.label || '', created: t.created || 0, classes: byOwner[norm(t.username)] || 0 });
        }
        teachers.sort((a, b) => (a.label || a.username).localeCompare(b.label || b.username));
        return json({ teachers });
      }
      if (request.method === 'POST') {
        let body;
        try { body = await request.json(); } catch (e) { return json({ error: 'bad-json' }, 400); }
        const username = norm(body && body.username);
        if (!validUser(username)) return json({ error: 'bad-username' }, 400);
        const pin = String((body && body.pin) || '').trim();
        const raw = await env.PROGRESS.get(teacherKey(username));
        const cur = raw ? JSON.parse(raw) : null;
        // PIN nur beim Anlegen Pflicht; beim Bearbeiten optional (leer = beibehalten).
        if (!cur && pin.length < 4) return json({ error: 'pin-too-short' }, 400);
        if (pin && pin.length < 4) return json({ error: 'pin-too-short' }, 400);
        const label = String((body && body.label) || (cur && cur.label) || '').trim().slice(0, 60);
        const t = { username, pin: pin || (cur && cur.pin) || '', label, created: cur ? (cur.created || Date.now()) : Date.now() };
        await env.PROGRESS.put(teacherKey(username), JSON.stringify(t));
        return json({ ok: true, teacher: { username: t.username, label: t.label, created: t.created } });
      }
      if (request.method === 'DELETE') {
        let body;
        try { body = await request.json(); } catch (e) { return json({ error: 'bad-json' }, 400); }
        const username = norm(body && body.username);
        if (!username) return json({ error: 'bad-username' }, 400);
        await env.PROGRESS.delete(teacherKey(username));
        return json({ ok: true });
      }
      return json({ error: 'method-not-allowed' }, 405);
    }

    if (p === '/api/teacher/classes') {
      if (request.method === 'GET') {
        const list = await env.PROGRESS.list({ prefix: 'class:' });
        const classes = [];
        for (const k of list.keys) {
          const raw = await env.PROGRESS.get(k.name);
          if (!raw) continue;
          const c = JSON.parse(raw);
          if (!owns(ctx, c)) continue; // Lehrer sehen nur eigene Klassen; Admin alle
          const game = classGame(c);
          const sl = await env.PROGRESS.list({ prefix: stPrefix(c.code) });
          const suffix = stSuffix(game);
          const students = sl.keys.filter((sk) => sk.name.endsWith(suffix)).length;
          classes.push({ code: c.code, label: c.label || '', created: c.created || 0, game, owner: c.owner || '', slots: Array.isArray(c.slots) ? c.slots.length : 0, students });
        }
        classes.sort((a, b) => (a.label || a.code).localeCompare(b.label || b.code));
        return json({ classes });
      }
      if (request.method === 'POST') {
        let body;
        try { body = await request.json(); } catch (e) { return json({ error: 'bad-json' }, 400); }
        const code = norm(body && body.code);
        if (!code) return json({ error: 'bad-code' }, 400);
        const count = Math.max(0, Math.min(200, parseInt((body && body.count), 10) || 0));
        const raw = await env.PROGRESS.get(classKey(code));
        const cur = raw ? JSON.parse(raw) : null;
        if (cur && !owns(ctx, cur)) return json({ error: 'forbidden' }, 403); // fremde Klasse
        const created = cur ? (cur.created || Date.now()) : Date.now();
        const owner = cur ? (cur.owner || ctx.user) : ctx.user; // Eigentümer = Ersteller
        const label = String((body && body.label) || (cur && cur.label) || '').trim().slice(0, 60);
        // Spiel: explizit gewähltes (sofern bekannt), sonst bestehendes, sonst Standard.
        const reqGame = norm(body && body.game);
        const game = gameAllowed(reqGame) ? reqGame : classGame(cur || {});
        let slots = (cur && Array.isArray(cur.slots)) ? cur.slots.slice() : [];
        let pw = (cur && cur.pw && typeof cur.pw === 'object') ? Object.assign({}, cur.pw) : {};
        if (slots.length + count > 500) return json({ error: 'too-many' }, 400);
        // Passwörter (neu) erzeugen – alte Index-Einträge entfernen, dann leeren.
        if (body && body.regenpw) {
          for (const n of slots) { const op = pw[norm(n)]; if (op) await env.PROGRESS.delete(lookKey(n, op)); }
          pw = {};
        }
        if (count > 0) slots = slots.concat(genSlots(slots, count));
        // Index (Name+Passwort)→Code aufbauen/auffrischen; macht Logins global eindeutig.
        pw = await ensureUniqueLogins(env, code, slots, pw);
        const cls = { code, label, created, slots, game, owner, pw };
        await env.PROGRESS.put(classKey(code), JSON.stringify(cls));
        return json({ ok: true, class: cls });
      }
      if (request.method === 'DELETE') {
        let body;
        try { body = await request.json(); } catch (e) { return json({ error: 'bad-json' }, 400); }
        const code = norm(body && body.code);
        if (!code) return json({ error: 'bad-code' }, 400);
        const raw = await env.PROGRESS.get(classKey(code));
        if (raw) {
          const c = JSON.parse(raw);
          if (!owns(ctx, c)) return json({ error: 'forbidden' }, 403);
          // Index-Einträge der Klasse aufräumen.
          if (c.pw && typeof c.pw === 'object') for (const n of (c.slots || [])) { const op = c.pw[norm(n)]; if (op) await env.PROGRESS.delete(lookKey(n, op)); }
        }
        await env.PROGRESS.delete(classKey(code));
        return json({ ok: true });
      }
      return json({ error: 'method-not-allowed' }, 405);
    }

    if (p === '/api/class') {
      const code = norm(url.searchParams.get('code'));
      if (!code) return json({ error: 'bad-params' }, 400);
      const clsRaw = await env.PROGRESS.get(classKey(code));
      const cls = clsRaw ? JSON.parse(clsRaw) : null;
      if (!cls) return json({ error: 'unknown-class' }, 404);
      if (!owns(ctx, cls)) return json({ error: 'forbidden' }, 403); // fremde Klasse
      const game = classGame(cls);
      const slots = cls && Array.isArray(cls.slots) ? cls.slots : [];
      const prefix = stPrefix(code);
      const suffix = stSuffix(game);
      const list = await env.PROGRESS.list({ prefix });
      const students = [];
      for (const k of list.keys) {
        if (!k.name.endsWith(suffix)) continue; // nur Stände des zugewiesenen Spiels
        const raw = await env.PROGRESS.get(k.name);
        if (!raw) continue;
        const s = JSON.parse(raw);
        students.push({
          name: s.name || decodeURIComponent(k.name.slice(prefix.length, k.name.length - suffix.length)),
          entdeckt: Array.isArray(s.deck) ? s.deck.length : 0,
          muenzen: s.coins || 0,
          xp: s.xp || 0,
          updated: s.updated || 0,
        });
      }
      students.sort((a, b) => b.xp - a.xp);
      return json({ code, game, owner: cls && cls.owner || '', slots, pw: cls && cls.pw || {}, anzahl: students.length, students });
    }
  }

  return json({ error: 'not-found' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(request, env, url);
    return env.ASSETS.fetch(request);
  },
};
