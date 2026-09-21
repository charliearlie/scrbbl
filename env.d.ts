declare namespace NodeJS {
  export interface ProcessEnv {
    FRONTEND_URL: string;
    LASTFM_API_KEY?: string;
    LASTFM_API_SECRET?: string;
    SESSION_SECRET?: string;
  }
}
