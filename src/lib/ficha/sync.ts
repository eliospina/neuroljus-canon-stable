/**
 * The ficha with an account: local-first, synced.
 *
 * The browser copy (localStore) stays the working copy, so every tool keeps
 * working offline and synchronously. When the carer is signed in, each save
 * is also pushed to their account, and on sign-in the account's records are
 * pulled and merged into the browser (newer updatedAt wins). This is what
 * lets a ficha travel from Ana's phone to the care home's computer.
 *
 * The account lives in Supabase (EU region, row-level security: a row is
 * readable and writable only by the user who owns it). See
 * supabase/migrations/0001_fichas.sql and docs/ficha/cuenta.md.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { sanitizeFicha, type Ficha } from "./model";
import { readFichas, registerSync, writeFichas } from "./localStore";

export type FichaRow = { id: string; data: unknown; updated_at: string };

let client: SupabaseClient | null | undefined;

/** The Supabase client, or null when the site runs without an account (no env vars). */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key && typeof window !== "undefined" ? createClient(url, key) : null;
  return client;
}

export const accountsAvailable = (): boolean => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Merge the account's records into the local ones. Pure. Newer updatedAt wins; unknown ids are added. */
export function mergeFichas(local: Ficha[], remote: Ficha[]): Ficha[] {
  const byId = new Map(local.map((f) => [f.id, f]));
  for (const r of remote) {
    const l = byId.get(r.id);
    if (!l || r.updatedAt > l.updatedAt) byId.set(r.id, r);
  }
  return [...byId.values()].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function rowToFicha(row: FichaRow): Ficha {
  const f = sanitizeFicha(row.data);
  return { ...f, id: row.id, updatedAt: row.updated_at || f.updatedAt };
}

export function fichaToRow(f: Ficha): FichaRow {
  return { id: f.id, data: f, updated_at: f.updatedAt };
}

/** Pull the signed-in user's records and merge them into this browser. Returns the merged list. */
export async function pullFichas(sb: SupabaseClient): Promise<Ficha[]> {
  const { data, error } = await sb.from("fichas").select("id, data, updated_at");
  if (error) throw error;
  const merged = mergeFichas(readFichas(), (data as FichaRow[]).map(rowToFicha));
  writeFichas(merged);
  return merged;
}

/** Push every local record the account does not have yet (first sign-in on a device that already had fichas). */
export async function pushAll(sb: SupabaseClient, list: Ficha[]): Promise<void> {
  if (list.length === 0) return;
  const { error } = await sb.from("fichas").upsert(list.map(fichaToRow), { onConflict: "id" });
  if (error) throw error;
}

/** Start syncing: every local save or delete also reaches the account. Returns a stop function. */
export function startSync(sb: SupabaseClient, onError: (e: unknown) => void = () => undefined): () => void {
  registerSync({
    push: (f) => {
      sb.from("fichas")
        .upsert(fichaToRow(f), { onConflict: "id" })
        .then(({ error }) => error && onError(error));
    },
    remove: (id) => {
      sb.from("fichas")
        .delete()
        .eq("id", id)
        .then(({ error }) => error && onError(error));
    },
  });
  return () => registerSync(null);
}
