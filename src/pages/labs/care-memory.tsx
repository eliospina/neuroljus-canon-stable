import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  addCareMemory,
  deleteCareMemory,
  readCareMemories,
  type CareMemory,
} from "@/lib/careMemory/localStore";

type Lang = "sv" | "en" | "es";

const emptyForm = {
  title: "",
  whatHappened: "",
  whatItTaught: "",
  tags: "",
  place: "",
};

export default function CareMemoryLab() {
  const [lang, setLang] = useState<Lang>("en");
  const [memories, setMemories] = useState<CareMemory[]>([]);
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
    setMemories(readCareMemories());
  }, []);

  const T = useMemo(
    () => ({
      sv: {
        seoTitle: "Omsorgsminne — Neuroljus",
        seoDesc:
          "Korta levda berättelser för projektet. Inte ett protokoll. En historia i taget.",
        platform: "Care Memory",
        kicker: "Lokal · en historia i taget · inte protokoll",
        heroTitle: "Dokumentera utan att tömma allt på en gång",
        heroSub:
          "Du har många erfarenheter. Börja med en. Vad hände? Vad lärde det projektet? Spara lokalt. Detta blir inte automatiskt ett vårdprotokoll.",
        frame:
          "Lager: minne → mönster → allvarlig händelse → protokoll. Protokoll bara när en mjuk sekvens upprepas. Projektet är internationellt — skriv land/plats om det spelar roll.",
        formTitle: "Ny minnesanteckning",
        title: "Titel",
        what: "Vad som hände",
        taught: "Vad det lärde Neuroljus / omsorgen",
        tags: "Taggar (smärta, gest, försummelse, robotik…)",
        place: "Land / plats (valfritt)",
        save: "Spara lokalt",
        saved: "Sparad i den här webbläsaren",
        listTitle: "Dina minnen",
        empty: "Inga minnen ännu. En historia räcker för att börja.",
        delete: "Ta bort",
        ctaPat: "Mönsteranteckningar",
        ctaInc: "Allvarlig händelse",
        ctaProto: "Protokoll (bara om sekvensen upprepas)",
        disclaimer:
          "Detta är projektminne, inte ett robotprotokoll. Intern yta — inte publikt pitch.",
      },
      en: {
        seoTitle: "Care Memory — Neuroljus",
        seoDesc:
          "Short lived stories for the project. Not a protocol. One story at a time.",
        platform: "Care Memory",
        kicker: "Local · one story at a time · not a protocol",
        heroTitle: "Document without emptying everything at once",
        heroSub:
          "You carry many experiences. Start with one. What happened? What did it teach the project? Save locally. This does not automatically become a care protocol.",
        frame:
          "Layers: memory → pattern → serious incident → protocol. Protocol only when a soft sequence repeats. The project is international — add country/place when it matters.",
        formTitle: "New memory note",
        title: "Title",
        what: "What happened",
        taught: "What it taught Neuroljus / care",
        tags: "Tags (pain, gesture, neglect, robotics…)",
        place: "Country / place (optional)",
        save: "Save locally",
        saved: "Saved in this browser",
        listTitle: "Your memories",
        empty: "No memories yet. One story is enough to begin.",
        delete: "Delete",
        ctaPat: "Pattern Notebook",
        ctaInc: "Serious Incident",
        ctaProto: "Protocol (only if the sequence repeats)",
        disclaimer:
          "This is project memory, not a robot protocol. Internal surface — not the public pitch.",
      },
      es: {
        seoTitle: "Memoria de cuidado — Neuroljus",
        seoDesc:
          "Historias vividas cortas para el proyecto. No es un protocolo. Una historia a la vez.",
        platform: "Care Memory",
        kicker: "Local · una historia a la vez · no es protocolo",
        heroTitle: "Documenta sin vaciarlo todo de una vez",
        heroSub:
          "Llevas muchas experiencias. Empieza con una. ¿Qué pasó? ¿Qué le enseñó al proyecto? Guarda en local. Esto no se convierte automáticamente en un protocolo de cuidado.",
        frame:
          "Capas: memoria → patrón → incidente grave → protocolo. Protocolo solo cuando una secuencia suave se repite. El proyecto es internacional — añade país/lugar cuando importe.",
        formTitle: "Nueva nota de memoria",
        title: "Título",
        what: "Qué pasó",
        taught: "Qué le enseñó a Neuroljus / al cuidado",
        tags: "Etiquetas (dolor, gesto, negligencia, robótica…)",
        place: "País / lugar (opcional)",
        save: "Guardar localmente",
        saved: "Guardado en este navegador",
        listTitle: "Tus memorias",
        empty: "Aún no hay memorias. Una historia basta para empezar.",
        delete: "Eliminar",
        ctaPat: "Cuaderno de patrones",
        ctaInc: "Incidente grave",
        ctaProto: "Protocolo (solo si la secuencia se repite)",
        disclaimer:
          "Esto es memoria de proyecto, no un protocolo de robot. Superficie interna — no el pitch público.",
      },
    }),
    []
  );

  const copy = T[lang];

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.whatHappened.trim()) return;
    const next = addCareMemory({
      title: form.title.trim(),
      whatHappened: form.whatHappened.trim(),
      whatItTaught: form.whatItTaught.trim(),
      tags: form.tags.trim(),
      place: form.place.trim(),
    });
    setMemories(next);
    setForm(emptyForm);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2200);
  }

  return (
    <>
      <Head>
        <title>{copy.seoTitle}</title>
        <meta name="description" content={copy.seoDesc} />
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#09090b" />
      </Head>

      <div className="page">
        <div className="statusbar" aria-hidden="true">
          <span>
            neuroljus://local · <b>care_memory_v0</b> · network=off · not_a_protocol
          </span>
          <span>one story at a time</span>
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
            <Link href="/labs/pattern-notebook">Patterns</Link>
            <Link href="/labs/serious-incident">Incident</Link>
            <Link href="/labs/future-care-room">Care Room</Link>
            <Link href="/observation-method">Observation</Link>
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
            <Link className="cta" href="/labs/pattern-notebook">
              {copy.ctaPat}
            </Link>
            <Link className="cta ghost" href="/labs/serious-incident">
              {copy.ctaInc}
            </Link>
            <Link className="cta ghost" href="/labs/robot-interface">
              {copy.ctaProto}
            </Link>
          </div>

          <section className="panel" aria-labelledby="form-title">
            <h2 id="form-title">{copy.formTitle}</h2>
            <form onSubmit={onSubmit}>
              <label>
                {copy.title}
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </label>
              <label>
                {copy.what}
                <textarea
                  required
                  rows={4}
                  value={form.whatHappened}
                  onChange={(e) => setForm((f) => ({ ...f, whatHappened: e.target.value }))}
                />
              </label>
              <label>
                {copy.taught}
                <textarea
                  rows={3}
                  value={form.whatItTaught}
                  onChange={(e) => setForm((f) => ({ ...f, whatItTaught: e.target.value }))}
                />
              </label>
              <label>
                {copy.tags}
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                />
              </label>
              <label>
                {copy.place}
                <input
                  value={form.place}
                  onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))}
                  placeholder="Sweden · Colombia · …"
                />
              </label>
              <div className="actions">
                <button type="submit">{copy.save}</button>
                {savedFlash && <span className="flash">{copy.saved}</span>}
              </div>
            </form>
          </section>

          <section className="panel" aria-labelledby="list-title">
            <h2 id="list-title">{copy.listTitle}</h2>
            {memories.length === 0 ? (
              <p className="empty">{copy.empty}</p>
            ) : (
              <ul className="notes">
                {memories.map((memory) => (
                  <li key={memory.id}>
                    <div className="noteHead">
                      <time dateTime={memory.createdAt}>
                        {new Date(memory.createdAt).toLocaleString()}
                      </time>
                      {memory.place && <span className="tag">{memory.place}</span>}
                      <button
                        type="button"
                        className="del"
                        onClick={() => setMemories(deleteCareMemory(memory.id))}
                      >
                        {copy.delete}
                      </button>
                    </div>
                    <p>
                      <strong>{memory.title}</strong>
                    </p>
                    <p>{memory.whatHappened}</p>
                    {memory.whatItTaught && <p className="muted">→ {memory.whatItTaught}</p>}
                    {memory.tags && <p className="muted">{memory.tags}</p>}
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
          --accent: #a5b4fc;
          --panel: rgba(24, 24, 27, 0.92);
          min-height: 100vh;
          background:
            radial-gradient(ellipse 70% 45% at 20% -10%, rgba(165, 180, 252, 0.12), transparent),
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
          font-size: clamp(1.75rem, 4vw, 2.4rem);
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
          padding: 0.55rem 0.9rem;
          border: 1px solid rgba(165, 180, 252, 0.45);
          color: var(--ink);
          text-decoration: none;
          font-size: 0.88rem;
          background: rgba(165, 180, 252, 0.08);
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
        input,
        textarea {
          width: 100%;
          background: #0c0c0e;
          border: 1px solid var(--line);
          color: var(--ink);
          padding: 0.55rem 0.65rem;
          font: inherit;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .actions button {
          background: var(--accent);
          color: #1e1b4b;
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
          border: 1px solid rgba(165, 180, 252, 0.35);
          color: var(--accent);
          padding: 0.1rem 0.35rem;
          font-size: 0.68rem;
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
      `}</style>
    </>
  );
}
