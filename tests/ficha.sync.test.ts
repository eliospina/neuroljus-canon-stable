import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyFicha, type Ficha } from "../src/lib/ficha/model";
import { fichaToRow, mergeFichas, rowToFicha } from "../src/lib/ficha/sync";
import { deleteFicha, readFichas, registerSync, saveFicha } from "../src/lib/ficha/localStore";

const at = (iso: string, over: Partial<Ficha> = {}): Ficha => ({ ...emptyFicha("es"), id: "ficha_a", name: "A", createdAt: iso, updatedAt: iso, ...over });

test("mergeFichas: newer wins, unknown ids are added, result is newest first", () => {
  const local = [at("2026-10-01T00:00:00Z", { name: "local old" }), at("2026-10-05T00:00:00Z", { id: "ficha_b", name: "only local" })];
  const remote = [at("2026-10-02T00:00:00Z", { name: "remote newer" }), at("2026-10-03T00:00:00Z", { id: "ficha_c", name: "only remote" })];
  const merged = mergeFichas(local, remote);
  assert.deepEqual(merged.map((f) => [f.id, f.name]), [["ficha_b", "only local"], ["ficha_c", "only remote"], ["ficha_a", "remote newer"]]);
  assert.deepEqual(mergeFichas([], []), []);
  const same = at("2026-10-02T00:00:00Z", { name: "local" });
  assert.equal(mergeFichas([same], [{ ...same, name: "remote" }])[0].name, "local", "a tie keeps the local copy");
});

test("a row round-trips through sanitize, and a bad row still yields a valid record with the row's id", () => {
  const f = at("2026-10-02T00:00:00Z", { calms: ["manta"] });
  const row = fichaToRow(f);
  assert.deepEqual(rowToFicha(row), f);
  const bad = rowToFicha({ id: "ficha_x", data: { name: 42, helps: "nope" }, updated_at: "2026-10-09T00:00:00Z" });
  assert.equal(bad.id, "ficha_x");
  assert.equal(bad.name, "");
  assert.equal(bad.updatedAt, "2026-10-09T00:00:00Z");
});

test("with a sync registered, saving and deleting in the browser store also reach it; test storages never do", () => {
  const pushed: string[] = [];
  const removed: string[] = [];
  registerSync({ push: (f) => void pushed.push(f.id), remove: (id) => void removed.push(id) });
  const m = new Map<string, string>();
  const s = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
  saveFicha(at("2026-10-02T00:00:00Z"), s);
  deleteFicha("ficha_a", s);
  assert.deepEqual([pushed, removed], [[], []], "an explicit storage (tests) bypasses sync");
  registerSync(null);
  assert.deepEqual(readFichas(s), []);
});
