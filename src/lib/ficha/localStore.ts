/**
 * Where the ficha lives today: this browser only (localStorage). The record
 * never leaves the device from here. When accounts arrive, this module keeps
 * the same functions and a server store sits behind them.
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
  return ficha;
}

export function deleteFicha(id: string, given?: Storage): Ficha[] {
  const next = readFichas(given).filter((f) => f.id !== id);
  writeFichas(next, given);
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
