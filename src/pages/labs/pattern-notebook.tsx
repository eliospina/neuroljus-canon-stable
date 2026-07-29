import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  addPatternNote,
  deletePatternNote,
  readPatternNotes,
  type PatternNote,
} from "@/lib/carePatterns/localStore";

type Lang = "sv" | "en" | "es";

const emptyForm = {
  gesture: "",
  context: "",
  eased: "",
  worsened: "",
  uncertainty: "",
  seenBefore: false,
};

export default function PatternNotebook() {
  const [lang, setLang] = useState<Lang>("en");
  const [notes, setNotes] = useState<PatternNote[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    try {
      const browserLang = navigator.language?.toLowerCase() || "";
      if (browserLang.startsWith("sv")) setLang("sv");
      else if (browserLang.startsWith("es")) setLang("es");
      else setLang("en");
    } catch {
      setLang("en");
    }
    setNotes(readPatternNotes());
  }, []);

  const T = useMemo(
    () => ({
      sv: {
        seoTitle: "Mönsteranteckningar — Neuroljus",
        seoDesc:
          "Lokala anteckningar om gester, lindring och osäkerhet. Vårdgivarvittne — ingen diagnos.",
        platform: "Pattern Notebook",
        kicker: "Lokal · ingen inloggning · vårdgivarvittne",
        heroTitle: "Mönster du lär dig genom att titta",
        heroSub:
          "Öppen portal — inga dörrar, inga konton, ingen biometrisk igenkänning. Neuroljus skiljer inte besökare åt. Här sparar DU vad som verkade lindra eller förvärra hos personen du vårdar — lokalt i den här webbläsaren.",
        frame:
          "Detta är inte automatisk mönsterdetektering mellan främlingar. Det är din vårdgivarminne, strukturerad. Framtida personprofiler med samtycke är en lärandehorisont — inte byggt här ännu. Ingen diagnos av smärta eller genetik.",
        formTitle: "Ny anteckning",
        gesture: "Observerad gest / hållning / ljud",
        context: "Sammanhang (ljus, ljud, rutin, personer nära)",
        eased: "Vad som verkade lindra",
        worsened: "Vad som verkade förvärra",
        uncertainty: "Vad du inte kan veta",
        seenBefore: "Jag har sett ett liknande mönster hos den här personen tidigare",
        save: "Spara lokalt",
        saved: "Sparad i den här webbläsaren",
        listTitle: "Dina anteckningar",
        empty: "Inga anteckningar ännu. Börja med en gest du nyss såg.",
        delete: "Ta bort",
        ctaRoom: "Öppna Care Room · Possible discomfort",
        ctaObs: "Observation Method",
        disclaimer:
          "Ingen medicinsk bedömning. Om oro kvarstår: kontakta vård. Trådlösa band/bälten är en framtida adapterhorisont — inte en produkt här.",
      },
      en: {
        seoTitle: "Pattern Notebook — Neuroljus",
        seoDesc:
          "Local notes on gestures, relief, and uncertainty. Caregiver witness — not diagnosis.",
        platform: "Pattern Notebook",
        kicker: "Local · no login · caregiver witness",
        heroTitle: "Patterns you learn by watching",
        heroSub:
          "Open portal — no doors, no accounts, no biometric recognition. Neuroljus does not tell visitors apart. Here YOU save what seemed to ease or worsen for the person you care for — local to this browser.",
        frame:
          "This is not automatic pattern detection across strangers. It is your caregiver memory, structured. Future person-linked profiles with consent are a learning horizon — not built here yet. No diagnosis of pain or genetics.",
        formTitle: "New note",
        gesture: "Observed gesture / posture / sound",
        context: "Context (light, sound, routine, people nearby)",
        eased: "What seemed to ease",
        worsened: "What seemed to worsen",
        uncertainty: "What you cannot know",
        seenBefore: "I have seen a similar pattern with this person before",
        save: "Save locally",
        saved: "Saved in this browser",
        listTitle: "Your notes",
        empty: "No notes yet. Start with a gesture you just saw.",
        delete: "Delete",
        ctaRoom: "Open Care Room · Possible discomfort",
        ctaObs: "Observation Method",
        disclaimer:
          "Not a medical assessment. If concern remains: contact healthcare. Wireless belts/bands are a future adapter horizon — not a product here.",
      },
      es: {
        seoTitle: "Cuaderno de patrones — Neuroljus",
        seoDesc:
          "Notas locales sobre gestos, alivio e incertidumbre. Testigo cuidador — no diagnóstico.",
        platform: "Pattern Notebook",
        kicker: "Local · sin login · testigo cuidador",
        heroTitle: "Patrones que aprendes mirando",
        heroSub:
          "Portal abierto — sin puertas, sin cuentas, sin reconocimiento biométrico. Neuroljus no distingue visitantes. Aquí guardas TÚ lo que pareció aliviar o empeorar en la persona a quien cuidas — solo en este navegador.",
        frame:
          "Esto no es detección automática de patrones entre desconocidos. Es tu memoria de cuidadora, estructurada. Perfiles personales futuros con consentimiento son un horizonte de aprendizaje — aún no construido aquí. Sin diagnóstico de dolor ni genética.",
        formTitle: "Nueva nota",
        gesture: "Gesto / postura / sonido observado",
        context: "Contexto (luz, sonido, rutina, personas cerca)",
        eased: "Lo que pareció aliviar",
        worsened: "Lo que pareció empeorar",
        uncertainty: "Lo que no puedes saber",
        seenBefore: "He visto un patrón similar con esta persona antes",
        save: "Guardar localmente",
        saved: "Guardado en este navegador",
        listTitle: "Tus notas",
        empty: "Aún no hay notas. Empieza con un gesto que acabas de ver.",
        delete: "Eliminar",
        ctaRoom: "Abrir Care Room · Possible discomfort",
        ctaObs: "Observation Method",
        disclaimer:
          "No es evaluación médica. Si la preocupación continúa: contacta salud. Cinturones/bandas inalámbricas son un horizonte futuro de adaptadores — no un producto aquí.",
      },
    }),
    []
  );

  const copy = T[lang];

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.gesture.trim()) return;
    const next = addPatternNote({
      gesture: form.gesture.trim(),
      context: form.context.trim(),
      eased: form.eased.trim(),
      worsened: form.worsened.trim(),
      uncertainty: form.uncertainty.trim(),
      seenBefore: form.seenBefore,
    });
    setNotes(next);
    setForm(emptyForm);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2200);
  }

  function onDelete(id: string) {
    setNotes(deletePatternNote(id));
  }

  return (
    <>
      <Head>
        <title>{copy.seoTitle}</title>
        <meta name="description" content={copy.seoDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#09090b" />
      </Head>

      <div className="page">
        <div className="statusbar" aria-hidden="true">
          <span>
            neuroljus://local · <b>care_patterns_v0</b> · network=off · storage=browser
          </span>
          <span>latency 0ms · caregiver_authority=true</span>
        </div>

        <header className="shell topnav" role="banner">
          <div className="brandRow">
            <Link href="/" className="logo">
              Neuroljus
            </Link>
            <span className="sep">/</span>
            <span className="platform">{copy.platform}</span>
          </div>
          <nav className="navLinks" aria-label="Primary">
            <Link href="/labs/future-care-room">Labs</Link>
            <Link href="/labs/nl-vision">NL-VISION</Link>
            <Link href="/observation-method">Observation</Link>
            <Link href="/labs/robot-interface">Protocol</Link>
          </nav>
          <div className="langToggle" role="group" aria-label="Language">
            <button type="button" onClick={() => setLang("es")} aria-pressed={lang === "es"}>
              ES
            </button>
            <button type="button" onClick={() => setLang("en")} aria-pressed={lang === "en"}>
              EN
            </button>
            <button type="button" onClick={() => setLang("sv")} aria-pressed={lang === "sv"}>
              SV
            </button>
          </div>
        </header>

        <main className="shell content">
          <p className="kicker">{copy.kicker}</p>
          <h1>{copy.heroTitle}</h1>
          <p className="heroSub">{copy.heroSub}</p>
          <p className="frame">{copy.frame}</p>

          <div className="ctaRow">
            <Link className="cta" href="/labs/future-care-room">
              {copy.ctaRoom}
            </Link>
            <Link className="cta ghost" href="/observation-method">
              {copy.ctaObs}
            </Link>
          </div>

          <section className="panel" aria-labelledby="form-title">
            <h2 id="form-title">{copy.formTitle}</h2>
            <form onSubmit={onSubmit}>
              <label>
                {copy.gesture}
                <textarea
                  required
                  rows={2}
                  value={form.gesture}
                  onChange={(e) => setForm((f) => ({ ...f, gesture: e.target.value }))}
                />
              </label>
              <label>
                {copy.context}
                <textarea
                  rows={2}
                  value={form.context}
                  onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
                />
              </label>
              <label>
                {copy.eased}
                <textarea
                  rows={2}
                  value={form.eased}
                  onChange={(e) => setForm((f) => ({ ...f, eased: e.target.value }))}
                />
              </label>
              <label>
                {copy.worsened}
                <textarea
                  rows={2}
                  value={form.worsened}
                  onChange={(e) => setForm((f) => ({ ...f, worsened: e.target.value }))}
                />
              </label>
              <label>
                {copy.uncertainty}
                <textarea
                  rows={2}
                  value={form.uncertainty}
                  onChange={(e) => setForm((f) => ({ ...f, uncertainty: e.target.value }))}
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.seenBefore}
                  onChange={(e) => setForm((f) => ({ ...f, seenBefore: e.target.checked }))}
                />
                <span>{copy.seenBefore}</span>
              </label>
              <div className="actions">
                <button type="submit">{copy.save}</button>
                {savedFlash && <span className="flash">{copy.saved}</span>}
              </div>
            </form>
          </section>

          <section className="panel" aria-labelledby="list-title">
            <h2 id="list-title">{copy.listTitle}</h2>
            {notes.length === 0 ? (
              <p className="empty">{copy.empty}</p>
            ) : (
              <ul className="notes">
                {notes.map((note) => (
                  <li key={note.id}>
                    <div className="noteHead">
                      <time dateTime={note.createdAt}>
                        {new Date(note.createdAt).toLocaleString()}
                      </time>
                      {note.seenBefore && <span className="tag">pattern</span>}
                      <button type="button" className="del" onClick={() => onDelete(note.id)}>
                        {copy.delete}
                      </button>
                    </div>
                    <p>
                      <strong>{note.gesture}</strong>
                    </p>
                    {note.context && <p>{note.context}</p>}
                    {note.eased && (
                      <p>
                        + {note.eased}
                      </p>
                    )}
                    {note.worsened && (
                      <p>
                        − {note.worsened}
                      </p>
                    )}
                    {note.uncertainty && <p className="muted">? {note.uncertainty}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="disclaimer">{copy.disclaimer}</p>
        </main>
      </div>

      <style jsx>{`
        .page {
          --bg: #09090b;
          --ink: #f4f4f5;
          --muted: #a1a1aa;
          --line: rgba(255, 255, 255, 0.1);
          --accent: #7dd3fc;
          --panel: rgba(24, 24, 27, 0.92);
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 20% -10%, rgba(125, 211, 252, 0.12), transparent),
            radial-gradient(ellipse 60% 40% at 90% 10%, rgba(167, 139, 250, 0.08), transparent),
            var(--bg);
          color: var(--ink);
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }
        .statusbar {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.45rem 1.25rem;
          font-size: 0.72rem;
          color: var(--muted);
          border-bottom: 1px solid var(--line);
          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
        }
        .shell {
          width: min(920px, calc(100% - 2rem));
          margin: 0 auto;
        }
        .topnav {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--line);
        }
        .brandRow {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
        }
        .logo {
          color: var(--ink);
          text-decoration: none;
          font-weight: 650;
          letter-spacing: -0.02em;
          font-size: 1.15rem;
        }
        .sep,
        .platform {
          color: var(--muted);
          font-size: 0.9rem;
        }
        .navLinks {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
        }
        .navLinks a {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.88rem;
        }
        .navLinks a:hover {
          color: var(--ink);
        }
        .langToggle {
          display: flex;
          gap: 0.25rem;
        }
        .langToggle button {
          background: transparent;
          border: 1px solid var(--line);
          color: var(--muted);
          padding: 0.25rem 0.45rem;
          cursor: pointer;
          font-size: 0.75rem;
        }
        .langToggle button[aria-pressed="true"] {
          color: var(--ink);
          border-color: var(--accent);
        }
        .content {
          padding: 2rem 0 4rem;
        }
        .kicker {
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.72rem;
          margin: 0 0 0.6rem;
        }
        h1 {
          font-weight: 550;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          line-height: 1.15;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
        }
        .heroSub,
        .frame,
        .disclaimer,
        .empty {
          color: var(--muted);
          line-height: 1.55;
          max-width: 62ch;
        }
        .ctaRow {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          margin: 1.25rem 0 2rem;
        }
        .cta {
          display: inline-flex;
          align-items: center;
          padding: 0.55rem 0.9rem;
          border: 1px solid rgba(125, 211, 252, 0.45);
          color: var(--ink);
          text-decoration: none;
          font-size: 0.88rem;
          background: rgba(125, 211, 252, 0.08);
        }
        .cta.ghost {
          border-color: var(--line);
          background: transparent;
          color: var(--muted);
        }
        .panel {
          background: var(--panel);
          border: 1px solid var(--line);
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .panel h2 {
          margin: 0 0 1rem;
          font-size: 1.05rem;
        }
        form {
          display: grid;
          gap: 0.85rem;
        }
        label {
          display: grid;
          gap: 0.35rem;
          font-size: 0.82rem;
          color: var(--muted);
        }
        textarea {
          width: 100%;
          resize: vertical;
          background: #0c0c0e;
          border: 1px solid var(--line);
          color: var(--ink);
          padding: 0.55rem 0.65rem;
          font: inherit;
        }
        .check {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          grid-template-columns: none;
        }
        .check input {
          margin-top: 0.2rem;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .actions button {
          background: var(--accent);
          color: #082f49;
          border: none;
          padding: 0.55rem 1rem;
          font-weight: 600;
          cursor: pointer;
        }
        .flash {
          color: var(--accent);
          font-size: 0.85rem;
        }
        .notes {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.85rem;
        }
        .notes li {
          border-top: 1px solid var(--line);
          padding-top: 0.85rem;
        }
        .notes li:first-child {
          border-top: none;
          padding-top: 0;
        }
        .noteHead {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
          font-size: 0.75rem;
          color: var(--muted);
        }
        .tag {
          border: 1px solid rgba(125, 211, 252, 0.35);
          color: var(--accent);
          padding: 0.1rem 0.35rem;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .del {
          margin-left: auto;
          background: transparent;
          border: 1px solid var(--line);
          color: var(--muted);
          cursor: pointer;
          font-size: 0.72rem;
          padding: 0.2rem 0.45rem;
        }
        .notes p {
          margin: 0.2rem 0;
          font-size: 0.92rem;
          line-height: 1.45;
        }
        .muted {
          color: var(--muted);
        }
        .disclaimer {
          font-size: 0.82rem;
          margin-top: 1.5rem;
        }
        @media (max-width: 720px) {
          .statusbar {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
