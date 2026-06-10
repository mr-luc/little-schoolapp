# Little-schoolapp

Zentrales **Multi-Spiel-Portal** für die Schule: Schüler:innen melden sich
**einmal** an (Klassencode + Login-Name) und bekommen automatisch das
**von der Lehrkraft zugewiesene Spiel**. Mehrere Spiele teilen sich einen
Login, einen KV-Speicher und einen Lehrer-Bereich.

- `index.html` – Portal-Login → Weiterleitung zum zugewiesenen Spiel.
- `lehrer.html` – Lehrer-Bereich: Klassen verwalten, Spiel zuweisen, Fortschritt.
- `worker.js` / `wrangler.toml` – Cloudflare Worker (`/api/*` + statische Assets).
- `games/chemie8/` – das Spiel „Little Chemie 8".
- `games/biologie8/` – das Spiel „Little Biologie 8".

Details zu Aufbau, Endpunkten und Betrieb: siehe [`CLOUDFLARE.md`](CLOUDFLARE.md).
