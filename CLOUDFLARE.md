# Portal „Little-SchoolApp" – Login, Spiel-Zuweisung & Spielstand-Sync (Cloudflare Worker)

Ein zentrales Portal, in dem sich Schüler:innen **einmal** anmelden und
automatisch das **von der Lehrkraft zugewiesene Spiel** bekommen. Mehrere
Spiele teilen sich **einen** Login, **einen** KV-Speicher und **einen**
Lehrer-Bereich.

**Login**: per **Login-Name + Passwort** (kein Klassencode nötig). Jede:r findet
den eigenen Stand (entdeckte Begriffe, Münzen, XP) auf jedem Gerät wieder – pro
Spiel getrennt. Der Server findet die Klasse über das **global eindeutige
(Name+Passwort)-Paar**.

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
│   ├── chemie8/            # das Spiel „Little Chemie 8" (index/app/style/effects)
│   └── biologie8/          # das Spiel „Bio-Alchemie" (Biologie 8)
└── CLOUDFLARE.md
```

## Datenmodell (KV-Namespace `PROGRESS`)

- `class:<code>` → `{ code, label, created, slots:[namen], game, owner, pw }`
  – `game` = zugewiesenes Spiel; `owner` = Benutzername der anlegenden Lehrkraft
  (oder `admin`); `pw` = Map `Login-Name → einfaches Passwort` (z. B. `apfel73`,
  case-insensitiv), beim Erzeugen der Logins automatisch vergeben.
- `st:<code>:<name>:<game>` → Spielstand `{ deck, coins, xp, name, game, updated }`
  – Spiel im Schlüssel, damit Stände je Spiel getrennt sind.
- `cfg:teacherpin` → **Admin-PIN**.
- `teacher:<username>` → Lehrer-Login `{ username, pin, label, created }`.
- `look:<name>:<pw>` → `<code>` – Index für den **code-freien Login**: löst das
  eindeutige (Login-Name + Passwort)-Paar zur Klasse auf.

## Rollen: Admin & Lehrer

- **Admin** meldet sich nur mit der **Admin-PIN** an (Benutzername leer). Der
  Admin sieht **alle** Klassen und verwaltet im Bereich „Lehrer-Logins" die
  Lehrkräfte (anlegen, PIN neu setzen, löschen).
- **Lehrer** melden sich mit **Benutzername + PIN** an und sehen/verwalten nur
  **ihre eigenen** Klassen.
- Authentifizierung per Header `X-Teacher-Pin` (+ `X-Teacher-User` für Lehrer).
  Klassen-Endpunkte prüfen Eigentum; admin-only ist `/api/admin/teachers`.

### Endpunkte (Admin)
- `GET|POST|DELETE /api/admin/teachers` – Lehrer-Logins verwalten
  (POST legt an/aktualisiert; PIN beim Anlegen Pflicht, beim Bearbeiten optional).

## Worker-Endpunkte

- `GET /api/ping` – Erkennung.
- `GET /api/games` – Liste verfügbarer Spiele `[{id,title}]` (für das Dropdown).
- `GET|POST /api/progress` – Schüler-Sync, mit `name`/`pw`/`game`-Parametern;
  Schlüssel inkl. Spiel. **Ohne `code`** löst der GET die Klasse über den
  `look:`-Index (Name+Passwort) auf und liefert `code` + `game` zurück (so
  meldet sich das Portal **ohne Klassencode** an). Prüft: Klasse existiert +
  Name in slots + Passwort + Spiel passt zum zugewiesenen Spiel. Die Spiele
  senden den (beim Login ermittelten) `code` weiterhin mit.
- `GET /api/teacher/status`, `POST /api/teacher/setup`, `POST /api/teacher/login`.
- `GET|POST|DELETE /api/teacher/classes` – beim Anlegen wird zusätzlich `game`
  gesetzt.
- `GET /api/class?code=` – liefert slots + game + `pw` (Passwort-Map) + students
  (des zugewiesenen Spiels).
- `POST /api/teacher/classes` mit `{code, regenpw:true}` – erzeugt neue
  Passwörter für alle Logins der Klasse.

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

Seite: **`https://DEINE-URL/lehrer.html`** – Login als **Admin** (nur Admin-PIN,
Benutzername leer) oder als **Lehrer** (Benutzername + PIN). Der Admin legt
Lehrer-Logins im Bereich „Lehrer-Logins verwalten" an. Danach im Bereich:

- **Klasse anlegen:** Klassencode + optionale Bezeichnung + **Anzahl Schüler** +
  **Spiel (Dropdown)**. **Login-Name und einfaches Passwort werden automatisch
  erzeugt** (z. B. `Argon-01` / `apfel73`) und in der Klassenansicht angezeigt.
- Pro Klasse die **Login-Liste mit Passwort und Status** ansehen (Level,
  Begriffe, Münzen, XP, „zuletzt aktiv"), **weitere Logins erzeugen**,
  **Passwörter neu erzeugen** und die Logins als **DIN-A4-PDF** exportieren
  (Druck-/„Als PDF speichern"-Ansicht mit Karten zum Austeilen).
- Schüler:innen melden sich im Portal nur mit **Login-Name + Passwort** an
  (kein Klassencode).

**Wichtig:** Schüler:innen melden sich im **Portal** mit **Login-Name +
Passwort** an und werden automatisch zum zugewiesenen Spiel weitergeleitet.
Login-Name und Passwort sind global eindeutig; der Server findet die Klasse
darüber. (Für vor diesem Update angelegte Klassen einmal „Passwörter neu
erzeugen", damit der Index aufgebaut wird.)

### Lehrer-PIN einrichten (einmalig, direkt auf der Seite)

Beim **ersten** Öffnen von `lehrer.html` erscheint „Lehrer-PIN festlegen" –
einfach eine PIN (mind. 4 Zeichen) wählen. Sie wird im KV gespeichert
(`cfg:teacherpin`). Optional hat ein **Worker-Secret** `TEACHER_PIN` (oder
`Teacher`) Vorrang; dann ist die In-App-Einrichtung deaktiviert.

## Schüler-Ablauf

1. Portal `index.html` öffnen → Login (Login-Name + Passwort).
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

- Keine E-Mail/Klarnamen nötig – nur pseudonymer Login-Name + einfaches
  Passwort (Klartext im KV, nur niedrigschwelliger Schutz fürs Klassenzimmer).
- Empfehlung: **Spitznamen** statt Klarnamen → Stand ist pseudonym.
- Wer den Klassencode kennt, kann Stände dieser Klasse lesen/überschreiben.
  Vor produktivem Einsatz mit der/dem Datenschutzbeauftragten klären.
