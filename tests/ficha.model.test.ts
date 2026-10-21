import assert from "node:assert/strict";
import { test } from "node:test";
import { avoidList, cardOf, decodeCard, emptyFicha, encodeCard, rankHelps, sanitizeFicha, type Ficha } from "../src/lib/ficha/model";
import { deleteFicha, readFicha, readFichas, saveFicha } from "../src/lib/ficha/localStore";

function memoryStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

function mateo(): Ficha {
  return {
    ...emptyFicha("es", "carer"),
    id: "ficha_test_mateo",
    name: "Mateo",
    age: "child",
    speech: "no",
    calms: ["ruido marrón", "luces apagadas menos el pasillo", "su manta"],
    triggers: ["que lo toquen", "voces altas", "cambios de plan"],
    inTheirWords: "No me toques cuando grito. Espera.",
    signals: [
      { sign: "tararea más fuerte", meaning: "viene sobrecarga", confirmed: 4 },
      { sign: "manos en la cara", meaning: "dolor o miedo", confirmed: 2 },
    ],
    helps: [
      { text: "ruido marrón", tried: 11, helped: 9, worsened: 0 },
      { text: "tocarle el hombro", tried: 4, helped: 0, worsened: 4 },
      { text: "pasillo con luz", tried: 3, helped: 3, worsened: 0 },
    ],
    avoid: ["gritar su nombre"],
    crisis: { steps: ["Apaga las luces menos la del pasillo", "Pon ruido marrón", "No lo toques, quédate a dos metros"], whomToCall: "Ana 300 000 0000", medication: "", clinician: "" },
  };
}

test("sanitizeFicha: garbage becomes an empty record, good input survives with limits", () => {
  const empty = sanitizeFicha("nope");
  assert.equal(empty.name, "");
  assert.equal(empty.owner, "carer");
  assert.deepEqual(empty.helps, []);

  const f = sanitizeFicha({ ...mateo(), name: "x".repeat(200), calms: Array(50).fill("a"), helps: [{ text: "t", tried: -3, helped: "9", worsened: 1e9 }], owner: "person", age: "elder" });
  assert.equal(f.name.length, 60);
  assert.equal(f.calms.length, 24);
  assert.deepEqual(f.helps[0], { text: "t", tried: 0, helped: 0, worsened: 9999 });
  assert.equal(f.owner, "person");
  assert.equal(f.age, "child");
  assert.equal(f.id, "ficha_test_mateo");
});

test("rankHelps puts what helped first and what hurt last; avoidList learns from the counts", () => {
  const ranked = rankHelps(mateo().helps).map((h) => h.text);
  assert.deepEqual(ranked, ["ruido marrón", "pasillo con luz", "tocarle el hombro"]);
  assert.deepEqual(avoidList(mateo()), ["gritar su nombre", "tocarle el hombro"]);
});

test("the card is the person in thirty seconds: words first, evidence-ranked do and dont, three steps", () => {
  const card = cardOf(mateo());
  assert.equal(card.name, "Mateo");
  assert.equal(card.words, "No me toques cuando grito. Espera.");
  assert.deepEqual(card.signals[0], { sign: "tararea más fuerte", meaning: "viene sobrecarga" });
  assert.deepEqual(card.do, ["ruido marrón", "pasillo con luz", "luces apagadas menos el pasillo", "su manta"]);
  assert.deepEqual(card.dont, ["gritar su nombre", "tocarle el hombro", "que lo toquen", "voces altas", "cambios de plan"]);
  assert.equal(card.steps.length, 3);
  assert.equal(card.whomToCall, "Ana 300 000 0000");
  assert.equal(card.medication, "");
});

test("the card survives the trip through a link, and a bad link is null", () => {
  const card = cardOf(mateo());
  const code = encodeCard(card);
  assert.match(code, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeCard(code), card);
  assert.equal(decodeCard("not a card"), null);
  assert.equal(decodeCard(encodeCard({ ...card, v: 2 as never })), null);
});

test("local store: save, read, update and delete, all through sanitize", () => {
  const s = memoryStorage();
  assert.deepEqual(readFichas(s), []);
  const saved = saveFicha(mateo(), s);
  assert.equal(readFicha("ficha_test_mateo", s)?.name, "Mateo");
  assert.ok(saved.updatedAt >= saved.createdAt);
  saveFicha({ ...saved, name: "Mateo G." }, s);
  assert.equal(readFichas(s).length, 1);
  assert.equal(readFicha("ficha_test_mateo", s)?.name, "Mateo G.");
  s.setItem("neuroljus.ficha.v1", "{broken");
  assert.deepEqual(readFichas(s), []);
  saveFicha(mateo(), s);
  assert.deepEqual(deleteFicha("ficha_test_mateo", s), []);
});

import { recordNote, recordTry } from "../src/lib/ficha/model";
import { readActiveId, updateFicha, writeActiveId } from "../src/lib/ficha/localStore";

test("recordTry counts a try, matches case-insensitively, and adds what is new", () => {
  let f = recordTry(mateo(), "Ruido Marrón", "helped");
  assert.deepEqual(f.helps[0], { text: "ruido marrón", tried: 12, helped: 10, worsened: 0 });
  f = recordTry(f, "Transición nocturna", "worse");
  assert.deepEqual(f.helps.at(-1), { text: "Transición nocturna", tried: 1, helped: 0, worsened: 1 });
  f = recordTry(f, "Transición nocturna", "no_change");
  assert.deepEqual(f.helps.at(-1), { text: "Transición nocturna", tried: 2, helped: 0, worsened: 1 });
  assert.equal(recordTry(f, "   ", "helped"), f);
});

test("recordNote turns a notebook note into a signal and two counts", () => {
  const f = recordNote(mateo(), { gesture: "Tararea más fuerte", context: "", eased: "su manta", worsened: "voces altas" });
  assert.equal(f.signals[0].confirmed, 5);
  assert.equal(f.signals[0].meaning, "viene sobrecarga");
  assert.deepEqual(f.helps.find((h) => h.text === "su manta"), { text: "su manta", tried: 1, helped: 1, worsened: 0 });
  assert.deepEqual(f.helps.find((h) => h.text === "voces altas"), { text: "voces altas", tried: 1, helped: 0, worsened: 1 });
  const g = recordNote(mateo(), { gesture: "muerde la manga", context: "antes de salir", eased: "", worsened: "" });
  assert.deepEqual(g.signals.at(-1), { sign: "muerde la manga", meaning: "antes de salir", confirmed: 1 });
});

test("the active record survives only while it exists, and updateFicha saves through it", () => {
  const s = memoryStorage();
  saveFicha(mateo(), s);
  writeActiveId("ficha_test_mateo", s);
  assert.equal(readActiveId(s), "ficha_test_mateo");
  const saved = updateFicha("ficha_test_mateo", (f) => recordTry(f, "su manta", "helped"), s);
  assert.equal(readFicha("ficha_test_mateo", s)?.helps.find((h) => h.text === "su manta")?.helped, 1);
  assert.ok(saved);
  assert.equal(updateFicha("ficha_nope", (f) => f, s), null);
  deleteFicha("ficha_test_mateo", s);
  assert.equal(readActiveId(s), null);
});
