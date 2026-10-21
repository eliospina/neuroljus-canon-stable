/**
 * La ficha de la persona: what is known about one autistic person, kept in
 * one place, growing with use, handed to whoever is in front of them.
 * Design: docs/strategy/ficha-de-la-persona.md.
 *
 * This module is pure: types, defaults, validation, the 30-second card and
 * its link encoding. No storage, no network. The person owns the record
 * (owner: "person") or a carer keeps it for them (owner: "carer").
 */

export type FichaLang = "es" | "en" | "sv";
export type Speech = "yes" | "some" | "no";
export type AgeBand = "child" | "teen" | "adult";
export type Owner = "person" | "carer";

/** Something that was tried, with counts. The counts are the evidence. */
export type Tried = { text: string; tried: number; helped: number; worsened: number };
/** A signal and what it means in this person. Confirmed = how many times it held. */
export type Signal = { sign: string; meaning: string; confirmed: number };

export type Crisis = {
  /** Three lines to read in thirty seconds. */
  steps: string[];
  whomToCall: string;
  /** Optional, only if the carer writes it. Never asked for. */
  medication: string;
  clinician: string;
};

export type Ficha = {
  version: 1;
  id: string;
  createdAt: string;
  updatedAt: string;
  owner: Owner;
  lang: FichaLang;
  /** A name or a nickname. Nothing else identifying is ever required. */
  name: string;
  age: AgeBand;
  speech: Speech;
  /** The five questions. */
  calms: string[];
  triggers: string[];
  /** Written by the person, or gathered by whoever knows them. Always shown first. */
  inTheirWords: string;
  signals: Signal[];
  helps: Tried[];
  /** Never do. */
  avoid: string[];
  crisis: Crisis;
};

/** The 30-second card: what a new carer reads before touching anyone. */
export type Card = {
  v: 1;
  name: string;
  age: AgeBand;
  speech: Speech;
  lang: FichaLang;
  words: string;
  signals: Array<{ sign: string; meaning: string }>;
  do: string[];
  dont: string[];
  steps: string[];
  whomToCall: string;
  medication: string;
  clinician: string;
};

export const MAX_TEXT = 240;
export const MAX_WORDS = 1200;
export const MAX_ITEMS = 24;
export const CARD_ITEMS = 5;

const AGES: AgeBand[] = ["child", "teen", "adult"];
const SPEECHES: Speech[] = ["yes", "some", "no"];
const LANGS: FichaLang[] = ["es", "en", "sv"];

export function newId(): string {
  return `ficha_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyFicha(lang: FichaLang = "es", owner: Owner = "carer"): Ficha {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: newId(),
    createdAt: now,
    updatedAt: now,
    owner,
    lang,
    name: "",
    age: "child",
    speech: "no",
    calms: [],
    triggers: [],
    inTheirWords: "",
    signals: [],
    helps: [],
    avoid: [],
    crisis: { steps: [], whomToCall: "", medication: "", clinician: "" },
  };
}

const str = (v: unknown, max = MAX_TEXT): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const count = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(Math.min(v, 9999)) : 0);
const strList = (v: unknown, max = MAX_ITEMS): string[] =>
  Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean).slice(0, max) : [];

function tried(v: unknown): Tried | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const text = str(o.text);
  if (!text) return null;
  return { text, tried: count(o.tried), helped: count(o.helped), worsened: count(o.worsened) };
}

function signal(v: unknown): Signal | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const sign = str(o.sign);
  if (!sign) return null;
  return { sign, meaning: str(o.meaning), confirmed: count(o.confirmed) };
}

/** Validate anything (localStorage, an imported file). Unknown values fall back to defaults. */
export function sanitizeFicha(input: unknown): Ficha {
  const base = emptyFicha();
  if (!input || typeof input !== "object") return base;
  const o = input as Record<string, unknown>;
  const crisis = o.crisis && typeof o.crisis === "object" ? (o.crisis as Record<string, unknown>) : {};
  const id = str(o.id, 64);
  return {
    version: 1,
    id: /^ficha_[a-z0-9_]+$/.test(id) ? id : base.id,
    createdAt: str(o.createdAt, 40) || base.createdAt,
    updatedAt: str(o.updatedAt, 40) || base.updatedAt,
    owner: o.owner === "person" ? "person" : "carer",
    lang: LANGS.includes(o.lang as FichaLang) ? (o.lang as FichaLang) : "es",
    name: str(o.name, 60),
    age: AGES.includes(o.age as AgeBand) ? (o.age as AgeBand) : "child",
    speech: SPEECHES.includes(o.speech as Speech) ? (o.speech as Speech) : "no",
    calms: strList(o.calms),
    triggers: strList(o.triggers),
    inTheirWords: str(o.inTheirWords, MAX_WORDS),
    signals: Array.isArray(o.signals) ? (o.signals.map(signal).filter(Boolean) as Signal[]).slice(0, MAX_ITEMS) : [],
    helps: Array.isArray(o.helps) ? (o.helps.map(tried).filter(Boolean) as Tried[]).slice(0, MAX_ITEMS) : [],
    avoid: strList(o.avoid),
    crisis: {
      steps: strList(crisis.steps, 6),
      whomToCall: str(crisis.whomToCall),
      medication: str(crisis.medication),
      clinician: str(crisis.clinician),
    },
  };
}

/** Helps ranked by evidence: what helped most, net of what made it worse, then most tried. */
export function rankHelps(helps: Tried[]): Tried[] {
  return [...helps].sort((a, b) => b.helped - b.worsened - (a.helped - a.worsened) || b.tried - a.tried);
}

/** Things to avoid: the explicit list, plus anything tried that made it worse more often than it helped. */
export function avoidList(f: Pick<Ficha, "avoid" | "helps">): string[] {
  const learned = f.helps.filter((h) => h.worsened > h.helped).map((h) => h.text);
  return [...f.avoid, ...learned.filter((t) => !f.avoid.includes(t))];
}

/** The card: the five calming things count as "do" until something has been tried; triggers as "dont". */
export function cardOf(f: Ficha): Card {
  const ranked = rankHelps(f.helps).filter((h) => h.helped >= h.worsened).map((h) => h.text);
  const doList = [...ranked, ...f.calms.filter((c) => !ranked.includes(c))].slice(0, CARD_ITEMS);
  const dontList = [...avoidList(f), ...f.triggers.filter((t) => !f.avoid.includes(t))].slice(0, CARD_ITEMS);
  return {
    v: 1,
    name: f.name,
    age: f.age,
    speech: f.speech,
    lang: f.lang,
    words: f.inTheirWords,
    signals: [...f.signals]
      .sort((a, b) => b.confirmed - a.confirmed)
      .slice(0, CARD_ITEMS)
      .map((s) => ({ sign: s.sign, meaning: s.meaning })),
    do: doList,
    dont: dontList,
    steps: f.crisis.steps.slice(0, 3),
    whomToCall: f.crisis.whomToCall,
    medication: f.crisis.medication,
    clinician: f.crisis.clinician,
  };
}

// ---------------------------------------------------------------------------
// The card as a link. Today the link carries the card itself (nothing is stored
// anywhere); anyone holding the link can read it, and it cannot expire. When the
// record moves to a server, the link becomes a token with an expiry.

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array | null {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  try {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export function encodeCard(card: Card): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(card)));
}

export function decodeCard(code: string): Card | null {
  const bytes = fromBase64Url(code.trim());
  if (!bytes) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (o.v !== 1) return null;
    const sig = Array.isArray(o.signals)
      ? o.signals
          .map((s) => (s && typeof s === "object" ? { sign: str((s as Record<string, unknown>).sign), meaning: str((s as Record<string, unknown>).meaning) } : null))
          .filter((s): s is { sign: string; meaning: string } => !!s && !!s.sign)
          .slice(0, CARD_ITEMS)
      : [];
    return {
      v: 1,
      name: str(o.name, 60),
      age: AGES.includes(o.age as AgeBand) ? (o.age as AgeBand) : "child",
      speech: SPEECHES.includes(o.speech as Speech) ? (o.speech as Speech) : "no",
      lang: LANGS.includes(o.lang as FichaLang) ? (o.lang as FichaLang) : "es",
      words: str(o.words, MAX_WORDS),
      signals: sig,
      do: strList(o.do, CARD_ITEMS),
      dont: strList(o.dont, CARD_ITEMS),
      steps: strList(o.steps, 3),
      whomToCall: str(o.whomToCall),
      medication: str(o.medication),
      clinician: str(o.clinician),
    };
  } catch {
    return null;
  }
}
