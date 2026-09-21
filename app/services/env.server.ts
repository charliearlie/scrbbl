/**
 * Single place where secrets enter the app.
 *
 * These values used to be literals in the source. They are read from the
 * environment now, but they keep their original values as a fallback so
 * local development and the existing deployment carry on working without
 * anyone having to set anything first. Production logs a warning instead of
 * throwing, so a missing variable degrades rather than takes the site down.
 *
 * The Last.FM API secret is in this repo's git history, so rotating it at
 * https://www.last.fm/api/accounts is worth doing independently of this.
 */

const warned = new Set<string>();

function readSecret(name: string, fallback: string): string {
  const value = process.env[name];
  if (value) return value;

  if (process.env.NODE_ENV === "production" && !warned.has(name)) {
    warned.add(name);
    console.warn(
      `[scrbbl] ${name} is not set. Falling back to the value committed in the repo. ` +
        `Set it in your hosting provider's environment variables.`
    );
  }

  return fallback;
}

export const LASTFM_API_KEY = readSecret(
  "LASTFM_API_KEY",
  "5e51b3c171721101d22f4101dd227f66"
);

export const LASTFM_API_SECRET = readSecret(
  "LASTFM_API_SECRET",
  "f7cb71083eceb100599f7f47d9c220a3"
);

export const SESSION_SECRET = readSecret(
  "SESSION_SECRET",
  "arandomsessionsecretlad"
);
