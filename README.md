# Scrbbl

https://scrbbl.vercel.app

Scrbbl is a manual Last.FM scrobbler which allows you to 'scrobble' tracks your scrobbler may have missed.

### Features

- Individual track scrobbles, with Apple Music autofill
- Scrobble entire albums, choosing which tracks count and correcting titles first
- Timestamps you pick, spaced by real track length so the play order matches the record
- A log of every batch sent, with what Last.FM accepted and what it refused
- Scrobble BBC radio, read from the stations' own Last.FM accounts
- A shelf of records you own, rated and reviewed, with real sleeve scans
- The gap between what you own and what you play, in both directions
- Scrobble from BBC radio stations _(Coming soon)_
- Scrobble in bulk from a database or spreadsheet _(Coming soon)_

#### Built with

- React
- Remix
- Tailwind

### Running it locally

Node 24 is what production runs on; `.nvmrc` pins it.

```sh
nvm use   # Node 24
yarn
yarn dev
```

`engines` is a floor (`>=22.0.0`) rather than an exact pin, so Node 22 still
works locally. Vercel resolves a range to the highest major it offers, so
deployments land on the latest 24.x either way.

### Environment

Secrets used to be literals in the source. They are read from the environment
now, with the old values as a fallback so nothing breaks if a variable is
missing. Copy them into `.env` locally, and set them in your hosting provider
for production:

| Variable             | What it is                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `LASTFM_API_KEY`     | Last.FM application key, from https://www.last.fm/api/accounts                           |
| `LASTFM_API_SECRET`  | Last.FM application secret                                                               |
| `SESSION_SECRET`     | Signs the session cookie. Any long random string; changing it logs everyone out          |
| `TURSO_DATABASE_URL` | libSQL database holding the scrobble log. Unset locally falls back to `file:./scrbbl.db` |
| `TURSO_AUTH_TOKEN`   | Token for that database. Not needed for the local file                                   |

Only the scrobble log needs a database. Without one, scrobbling works exactly
as before and the log is empty; production warns once in the function logs.
Local development needs no account at all — the SQLite fallback is gitignored.

To create the production database:

```sh
brew install tursodatabase/tap/turso   # or: curl -sSfL tur.so/install | bash
turso auth login                       # interactive
turso db create scrbbl
turso db show scrbbl --url             # -> TURSO_DATABASE_URL
turso db tokens create scrbbl          # -> TURSO_AUTH_TOKEN
```

The Last.FM API secret is in this repo's git history, so it is worth rotating
it at https://www.last.fm/api/accounts independently of moving it out of the
source.

### The shelf

Records you add yourself, not ones derived from your scrobbles. Each carries a
rating out of five, a note, and where possible a Cover Art Archive scan of the
real sleeve — front, and the back when the archive has one.

`/shelf/missing` sets the shelf against `user.getTopAlbums`: albums you play
often and never shelved, and records shelved and barely played. Discogs knows a
collection and Last.FM knows a listening history; this is the only place that
knows both.

Sleeve art is looked up once per record, at add time, through MusicBrainz
release _groups_ — cover art attaches per pressing and most pressings have
none. Spine colours are hashed from artist and title rather than sampled from
the artwork, which would mean shipping an image decoder for a ten-pixel band.

### Checks

```sh
yarn validate   # unit tests, lint, typecheck, formatting
yarn e2e        # Playwright, against a production build
```

`yarn e2e` builds the app and runs it on port 3111 against a throwaway SQLite
file, in Chromium and mobile WebKit. `e2e/session.ts` mints a real signed
session cookie so the logged-in routes are reachable without Last.FM's OAuth.

`e2e/smoke.spec.ts` loads every route with the browser console watched. It
exists because two bugs shipped where a component imported a value from a
`.server` module: Remix strips those from the client bundle, so the value is
`undefined` in the browser and the page dies on hydrate. The server still
renders it and returns 200, TypeScript resolves the module the way the server
does, and unit tests never open a browser — nothing else catches it.
