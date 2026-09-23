# Scrbbl

https://scrbbl.vercel.app

Scrbbl is a manual Last.FM scrobbler which allows you to 'scrobble' tracks your scrobbler may have missed.

### Features

- Individual track scrobbles, with Apple Music autofill
- Scrobble entire albums, choosing which tracks count and correcting titles first
- Timestamps you pick, spaced by real track length so the play order matches the record
- A log of every batch sent, with what Last.FM accepted and what it refused
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

### Checks

```sh
yarn validate   # tests, lint, typecheck, formatting
```
