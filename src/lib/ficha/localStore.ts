/**
 * Where the ficha lives: this browser (localStorage) as the working copy.
 * With an account signed in (sync.ts), every save and delete here also
 * reaches the account; without one, nothing leaves the device. Tests pass
 * their own storage and never touch the sync hook.
 */

import { sanitizeFicha, type Ficha } from "./model";

export const FICHA_KEY = "neuroljus.ficha.v1";
const MAX_FICHAS = 20;

type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "removeItem">;

function storage(given?: Storage): Storage | null {
  if (given) return given;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readFichas(given?: Storage): Ficha[] {
  const s = storage(given);
  if (!s) return [];
  try {
    const raw = s.getItem(FICHA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(sanitizeFicha).slice(0, MAX_FICHAS) : [];
  } catch {
    return [];
  }
}

export function writeFichas(list: Ficha[], given?: Storage): void {
  const s = storage(given);
  if (!s) return;
  s.setItem(FICHA_KEY, JSON.stringify(list.slice(0, MAX_FICHAS)));
}

export function readFicha(id: string, given?: Storage): Ficha | null {
  return readFichas(given).find((f) => f.id === id) ?? null;
}

/** Insert or replace by id; bumps updatedAt. Returns the stored record. */
export function saveFicha(input: Ficha, given?: Storage): Ficha {
  const ficha = { ...sanitizeFicha(input), updatedAt: new Date().toISOString() };
  const list = readFichas(given);
  const i = list.findIndex((f) => f.id === ficha.id);
  if (i >= 0) list[i] = ficha;
  else list.unshift(ficha);
  writeFichas(list, given);
  if (!given) sync?.push(ficha);
  return ficha;
}

export function deleteFicha(id: string, given?: Storage): Ficha[] {
  const next = readFichas(given).filter((f) => f.id !== id);
  writeFichas(next, given);
  if (!given) sync?.remove(id);
  return next;
}

/** The person the tools are working for right now (one per browser). */
export const ACTIVE_KEY = "neuroljus.ficha.active";

export function readActiveId(given?: Storage): string | null {
  const s = storage(given);
  if (!s) return null;
  try {
    const id = s.getItem(ACTIVE_KEY);
    return id && readFicha(id, given) ? id : null;
  } catch {
    return null;
  }
}

export function writeActiveId(id: string | null, given?: Storage): void {
  const s = storage(given);
  if (!s) return;
  if (id) s.setItem(ACTIVE_KEY, id);
  else s.removeItem(ACTIVE_KEY);
}

/** Read, change and save one record. Returns the saved record, or null if it does not exist. */
export function updateFicha(id: string, change: (f: Ficha) => Ficha, given?: Storage): Ficha | null {
  const f = readFicha(id, given);
  return f ? saveFicha(change(f), given) : null;
}

// ---------------------------------------------------------------------------
// Sync hook: when an account is signed in, sync.ts registers push/remove here
// and every local save or delete also reaches the account. Nothing else in the
// app needs to know whether an account exists.

export type FichaSync = { push: (f: Ficha) => void; remove: (id: string) => void };
let sync: FichaSync | null = null;

export function registerSync(next: FichaSync | null): void {
  sync = next;
}

export function currentSync(): FichaSync | null {
  return sync;
}
