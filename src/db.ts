import client from './lib/turso';

export const db = client;
export const auth = null; // Turso doesn't handle auth, need to keep this for compatibility if needed or remove
export const storage = null; // Turso doesn't handle storage
