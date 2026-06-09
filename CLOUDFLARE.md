# Portal „Little-schoolapp" – Login, Spiel-Zuweisung & Spielstand-Sync (Cloudflare Worker)

Ein zentrales Portal, in dem sich Schüler:innen **einmal** anmelden und
automatisch das **von der Lehrkraft zugewiesene Spiel** bekommen. Mehrere
Spiele teilen sich **einen** Login, **einen** KV-Speicher und **einen**
Lehrer-Bereich.

**Login**: per **Klassencode + Login-Name** (kein Passwort). Jede:r findet den
eigenen Stand (entdeckte Begriffe, Münzen, XP) auf jedem Gerät wieder – pro
Spiel getrennt.

Dieses Projekt läuft als **Cloudflare Worker mit statischen Assets**
(URL-Form `…workers.dev`):

- `worker.js` – bedient `/api/*` (Login/Sync, Spiele-Liste, Lehrer-Übersicht)
  und liefert sonst die statischen Dateien aus.
- `wrangler.toml` – Konfiguration: Worker-Einstieg, Assets-Verzeichnis und die
  **KV-Bindung `PROGRESS`** (mit der Namespace-ID).
- `.assetsignore` – verhindert, dass Code/Config als Website ausgeliefert wird.

## Verzeichnisstruktur

```
/
├── index.html              # Portal: Login → Weiterleitung zum zugewiesenen Spiel
├── lehrer.html             # Lehrer-Bereich (Login, Klassen, Spiel-Zuweisung)
├── worker.js               # Cloudflare Worker: /api/* + statische Auslieferung
├── wrangler.toml
├── .assetsignore
├── games/
│   └── chemie8/            # das Spiel „Little Chemie 8" (index/app/style/effects)
└── CLOUDFLARE.md
```

## Datenmodell (KV-Namespace `PROGRESS`)

- `class:<code>` → `{ code, label, created, slots:[namen], game }`
  – Feld `game` = das der Klasse zugewiesene Spiel.
- `st:<code>:<name>:<game>` → Spielstand `{ deck, coins, xp, name, game, updated }`
  – Spiel im Schlüssel, damit Stände je Spiel getrennt sind.
- `cfg:teacherpin` → Lehrer-PIN.

## Worker-Endpunkte

- `GET /api/ping` – Erkennung.
- `GET /api/games` – Liste verfügbarer Spiele `[{id,title}]` (für das Dropdown).
- `GET|POST /api/progress` – Schüler-Sync, mit `game`-Parameter; Schlüssel inkl.
  Spiel. Prüft: Klasse existiert + Name in slots (sofern slots) + Spiel passt
  zum zugewiesenen Spiel. Die Antwort enthält das `game` der Klasse.
- `GET /api/teacher/status`, `POST /api/teacher/setup`, `POST /api/teacher/login`.
- `GET|POST|DELETE /api/teacher/classes` – beim Anlegen wird zusätzlich `game`
  gesetzt.
- `GET /api/class?code=` – liefert slots + game + students (des zugewiesenen
  Spiels).

## Einrichtung

1. **KV-Namespace** – die **Namespace-ID** in `wrangler.toml` unter
   `[[kv_namespaces]] id = "…"` ist auf denselben Namespace wie little-chemie8
   gesetzt (`3d5084f60edb457da08df691b31a0a0d`), damit Klassen + Lehrer-PIN
   erhalten bleiben.
2. **Worker mit dem Repo verbinden** – Dashboard → *Workers & Pages* →
   *Create* → *Import a repository* → `mr-luc/little-schoolapp`. Da eine
   `wrangler.toml` vorhanden ist, wird bei jedem Push automatisch
   `wrangler deploy` ausgeführt – inklusive KV-Bindung und Assets.
3. **Fertig.** Beim Öffnen der `…workers.dev`-URL erscheint das Portal-Login.

## Lehrer-Bereich

Seite: **`https://DEINE-URL/lehrer.html`** – Login **nur mit der Lehrer-PIN**.
Danach im Bereich:

- **Klasse anlegen:** Klassencode + optionale Bezeichnung + **Anzahl Schüler** +
  **Spiel (Dropdown)**. Die **Login-Namen werden automatisch erzeugt** (z. B.
  `Argon-01`, `Helium-02`) und in der Klassenansicht angezeigt.
- Pro Klasse die **Login-Liste mit Status** ansehen (Level, Begriffe, Münzen,
  XP, „zuletzt aktiv") und bei Bedarf **weitere Logins erzeugen**.

**Wichtig:** Schüler:innen melden sich im **Portal** mit **Klassencode +
zugewiesenem Login-Namen** an und werden automatisch zum zugewiesenen Spiel
weitergeleitet. Es funktionieren **nur** der angelegte Code **und** die
erzeugten Namen. (Klassen ohne erzeugte Namen bleiben offen.)

### Lehrer-PIN einrichten (einmalig, direkt auf der Seite)

Beim **ersten** Öffnen von `lehrer.html` erscheint „Lehrer-PIN festlegen" –
einfach eine PIN (mind. 4 Zeichen) wählen. Sie wird im KV gespeichert
(`cfg:teacherpin`). Optional hat ein **Worker-Secret** `TEACHER_PIN` (oder
`Teacher`) Vorrang; dann ist die In-App-Einrichtung deaktiviert.

## Schüler-Ablauf

1. Portal `index.html` öffnen → Login (Klassencode + Login-Name).
2. Das Portal ermittelt das `game` der Klasse → Weiterleitung zu
   `/games/<game>/` (Login bleibt via localStorage gültig, gleiche Origin).
3. Das Spiel lädt seinen Stand über `/api/progress` mit seinem `game`-Wert.

## Ein weiteres Spiel hinzufügen

1. Spiel-Dateien nach `games/<game>/` legen (eigene `index.html` usw.).
2. Im Spiel die `fetch`-Aufrufe auf absolute `/api/...`-Pfade setzen und einen
   `game=<game>`-Parameter mitgeben; den Login aus dem Portal (ident in
   `localStorage`) übernehmen, ohne ihn auslesen geht es zurück zum Portal.
3. In `worker.js` das Spiel in der `GAMES`-Liste ergänzen `{id,title}`.

## Lokal testen

```bash
npx wrangler dev
```

## Datenschutz

- Keine Passwörter/E-Mail – nur Klassencode + (frei wählbarer) Login-Name.
- Empfehlung: **Spitznamen** statt Klarnamen → Stand ist pseudonym.
- Wer den Klassencode kennt, kann Stände dieser Klasse lesen/überschreiben.
  Vor produktivem Einsatz mit der/dem Datenschutzbeauftragten klären.
