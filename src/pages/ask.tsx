import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLang, type Lang } from "@/components/SiteLayout";
import type { AskLabel, AskResult } from "@/lib/ask/expert";
import { helpfulSummary } from "@/lib/companion/outcomes";
import { readRuns, type CompanionRun } from "@/lib/companion/runLog";
import { allIdeaStats, deleteIdea, MIN_RATED_RUNS, saveIdea, type IdeaStats } from "@/lib/ask/ideas";

const MAX = 800;

const T: Record<Lang, Record<string, string>> = {
  es: {
    title: "Pregunta a NeuroLjus",
    sub: "Un experto en autismo para cuidadores y personas autistas. Ayuda práctica primero; cada idea dice de dónde sale.",
    label: "¿Qué necesitas resolver?",
    placeholder: "Ej.: ¿Cómo preparo a Leo para el dentista?",
    examples: "Preguntas del día a día",
    ask: "Preguntar",
    asking: "Buscando en la biblioteca y pensando…",
    error: "No se pudo responder. Inténtalo de nuevo.",
    science: "Ciencia",
    practice: "Práctica conocida",
    person: "Datos de esta persona",
    idea: "Idea nueva de la IA",
    safety: "Seguridad",
    sources: "Estudios citados",
    legend: "Ciencia: cita un estudio verificado de la biblioteca · Práctica conocida: conocimiento de cuidado sin cita · Datos de esta persona: lo medido en Companion en este dispositivo, calculado por código · Idea nueva: hipótesis por probar, no un hecho.",
    disclaimer: "No diagnostica ni receta. Si hay peligro, llama al número de emergencias de tu país (112 en Suecia y la UE). Dudas médicas no urgentes en Suecia: 1177. Tu pregunta no se guarda en ningún registro.",
    personOn: "Se incluye un resumen anónimo de lo que ha ayudado en este dispositivo.",
    saveIdea: "Guardar idea",
    saved: "Guardada",
    ideas: "Cuaderno de ideas",
    ideasIntro: "Las ideas nuevas de la IA se guardan aquí. Pruébalas como rutina en Companion y valora cada vez; el código cuenta los casos.",
    tryIdea: "Probar en Companion",
    untested: "Sin probar",
    testing: "Probando: {rated} de {min} valoraciones",
    person_data: "Ya es dato de esta persona: ayudó {helped} de {rated}",
    not_helping: "No le ayuda: ayudó {helped} de {rated}",
    delete: "Borrar",
    navLibrary: "Biblioteca",
    navCompanion: "Companion",
    navHome: "Inicio",
    participatory: "con personas autistas",
    systematic_review: "revisión sistemática",
    meta_analysis: "metaanálisis",
    review: "revisión",
    study: "estudio",
  },
  en: {
    title: "Ask NeuroLjus",
    sub: "An autism expert for caregivers and autistic people. Practical help first; every idea says where it comes from.",
    label: "What do you need to solve?",
    placeholder: "E.g.: How do I prepare Leo for the dentist?",
    examples: "Everyday questions",
    ask: "Ask",
    asking: "Searching the library and thinking…",
    error: "Could not answer. Please try again.",
    science: "Science",
    practice: "Known practice",
    person: "Data from this person",
    idea: "New idea from the AI",
    safety: "Safety",
    sources: "Studies cited",
    legend: "Science: cites a verified study from the library · Known practice: care knowledge without a citation · Data from this person: what Companion measured on this device, computed by code · New idea: a hypothesis to try, not a fact.",
    disclaimer: "No diagnosis, no prescriptions. If there is danger, call your country's emergency number (112 in Sweden and the EU). Non-urgent medical questions in Sweden: 1177. Your question is not stored in any log.",
    personOn: "An anonymous summary of what has helped on this device is included.",
    saveIdea: "Save idea",
    saved: "Saved",
    ideas: "Ideas notebook",
    ideasIntro: "New ideas from the AI are kept here. Try them as a Companion routine and rate each run; the code counts the cases.",
    tryIdea: "Try in Companion",
    untested: "Untested",
    testing: "Testing: {rated} of {min} ratings",
    person_data: "Now data from this person: helped {helped} of {rated}",
    not_helping: "Not helping: helped {helped} of {rated}",
    delete: "Delete",
    navLibrary: "Library",
    navCompanion: "Companion",
    navHome: "Home",
    participatory: "with autistic people",
    systematic_review: "systematic review",
    meta_analysis: "meta-analysis",
    review: "review",
    study: "study",
  },
  sv: {
    title: "Fråga NeuroLjus",
    sub: "En autismexpert för vårdgivare och autistiska personer. Praktisk hjälp först; varje idé säger varifrån den kommer.",
    label: "Vad behöver du lösa?",
    placeholder: "T.ex.: Hur förbereder jag Leo för tandläkaren?",
    examples: "Vardagsfrågor",
    ask: "Fråga",
    asking: "Söker i biblioteket och tänker…",
    error: "Kunde inte svara. Försök igen.",
    science: "Vetenskap",
    practice: "Känd praxis",
    person: "Data om den här personen",
    idea: "Ny idé från AI:n",
    safety: "Säkerhet",
    sources: "Citerade studier",
    legend: "Vetenskap: citerar en verifierad studie i biblioteket · Känd praxis: omsorgskunskap utan citat · Data om den här personen: det Companion mätt på den här enheten, beräknat av kod · Ny idé: en hypotes att pröva, inte ett faktum.",
    disclaimer: "Ingen diagnos, inga recept. Vid fara, ring ditt lands nödnummer (112 i Sverige och EU). Icke-akuta medicinska frågor i Sverige: 1177. Din fråga sparas inte i någon logg.",
    personOn: "En anonym sammanfattning av vad som hjälpt på den här enheten ingår.",
    saveIdea: "Spara idé",
    saved: "Sparad",
    ideas: "Idébok",
    ideasIntro: "Nya idéer från AI:n sparas här. Prova dem som en Companion-rutin och bedöm varje gång; koden räknar fallen.",
    tryIdea: "Prova i Companion",
    untested: "Oprövad",
    testing: "Prövas: {rated} av {min} bedömningar",
    person_data: "Nu data om den här personen: hjälpte {helped} av {rated}",
    not_helping: "Hjälper inte: hjälpte {helped} av {rated}",
    delete: "Radera",
    navLibrary: "Bibliotek",
    navCompanion: "Companion",
    navHome: "Hem",
    participatory: "med autistiska personer",
    systematic_review: "systematisk översikt",
    meta_analysis: "metaanalys",
    review: "översikt",
    study: "studie",
  },
};

const EXAMPLES: Record<Lang, string[]> = {
  es: [
    "¿Cómo preparo a Leo para el dentista?",
    "Se tapa los oídos y grita en el supermercado. ¿Qué hago?",
    "No quiere comer nada que no sea pasta blanca.",
    "Mañana cambiamos de casa. ¿Cómo se lo explico sin palabras?",
    "Mi hija de 13 años vuelve del colegio agotada y se encierra. ¿Es normal?",
    "No se duerme antes de las dos de la mañana.",
  ],
  en: [
    "How do I prepare Leo for the dentist?",
    "She covers her ears and screams in the supermarket. What do I do?",
    "He will only eat plain white pasta.",
    "We move house tomorrow. How do I explain it without words?",
    "My 13-year-old comes home from school exhausted and shuts herself away. Is that normal?",
    "He does not fall asleep before two in the morning.",
  ],
  sv: [
    "Hur förbereder jag Leo för tandläkaren?",
    "Hon håller för öronen och skriker i affären. Vad gör jag?",
    "Han äter bara vit pasta.",
    "Vi flyttar i morgon. Hur förklarar jag det utan ord?",
    "Min 13-åring kommer hem utmattad från skolan och stänger in sig. Är det normalt?",
    "Han somnar inte före två på natten.",
  ],
};

const LABEL_CLASS: Record<AskLabel, string> = {
  science: "lab science",
  practice: "lab practice",
  person: "lab person",
  idea: "lab idea",
  safety: "lab safety",
};

export default function AskPage() {
  const [lang, setLang] = useLang("en");
  const t = T[lang];
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResult | null>(null);
  const [history, setHistory] = useState<ReturnType<typeof helpfulSummary>>([]);
  const [ideas, setIdeas] = useState<IdeaStats[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<Record<number, string>>({});

  const refreshLocal = useCallback(() => {
    try {
      const runs: CompanionRun[] = readRuns(window.localStorage);
      setHistory(helpfulSummary(runs));
      setIdeas(allIdeaStats(window.localStorage, runs));
    } catch {
      setHistory([]);
      setIdeas([]);
    }
  }, []);

  useEffect(() => {
    refreshLocal();
  }, [refreshLocal]);

  const keepIdea = (index: number, text: string) => {
    try {
      const idea = saveIdea(window.localStorage, text, lang);
      setSavedIdeas((prev) => ({ ...prev, [index]: idea.id }));
      refreshLocal();
    } catch {
      /* storage unavailable */
    }
  };

  const fillT = (key: string, v: Record<string, number>) => t[key].replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

  const submit = useCallback(
    async (text?: string) => {
      const question = (text ?? q).trim();
      if (!question || busy) return;
      setBusy(true);
      setError(null);
      setSavedIdeas({});
      try {
        const r = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, lang, helpfulRoutines: history }),
        });
        const j = (await r.json()) as AskResult | { ok: false; error?: string };
        if (!r.ok || !j.ok) {
          setError((j as { error?: string }).error || t.error);
          setResult(null);
        } else {
          setResult(j);
          window.setTimeout(() => document.getElementById("answer")?.scrollIntoView({ block: "start" }), 50);
        }
      } catch {
        setError(t.error);
        setResult(null);
      } finally {
        setBusy(false);
      }
    },
    [q, busy, lang, history, t.error]
  );

  return (
    <>
      <Head>
        <title>Ask NeuroLjus — an autism expert for caregivers</title>
        <meta
          name="description"
          content="Practical, cited answers for caregivers and autistic people. Science from a verified library, known practice, data from this person and new ideas — each labelled."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#efe9df" />
      </Head>
      <div className="page">
        <header className="top">
          <Link href="/" className="brand">
            NeuroLjus <span>{t.title}</span>
          </Link>
          <div className="lang" role="group" aria-label="Language">
            {(["es", "en", "sv"] as Lang[]).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <main>
          <h1>{t.title}</h1>
          <p className="sub">{t.sub}</p>

          <section className="card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <label htmlFor="q" className="label">
                {t.label}
              </label>
              <textarea
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value.slice(0, MAX))}
                placeholder={t.placeholder}
                rows={3}
                maxLength={MAX}
                enterKeyHint="send"
              />
              <p className="hint">
                <span className="count">
                  {q.length}/{MAX}
                </span>
              </p>
              <button type="submit" className="primary wide" disabled={busy || !q.trim()}>
                {busy ? t.asking : t.ask}
              </button>
            </form>
            {history.length > 0 && <p className="muted small">{t.personOn}</p>}
            <p className="label small">{t.examples}</p>
            <div className="examples">
              {EXAMPLES[lang].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className="example"
                  disabled={busy}
                  onClick={() => {
                    setQ(ex);
                    void submit(ex);
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </section>

          {result && (
            <section id="answer" className="answer" aria-live="polite">
              {result.notice && <p className="notice">{result.notice}</p>}
              {result.segments.map((s, i) => (
                <div key={i} className={`seg ${s.label}`}>
                  <span className={LABEL_CLASS[s.label]}>{t[s.label]}</span>
                  {s.label === "idea" && (
                    <span className="ideaActions">
                      {savedIdeas[i] ? (
                        <Link href={`/companion?idea=${encodeURIComponent(savedIdeas[i])}`} className="ghost">
                          {t.tryIdea} →
                        </Link>
                      ) : (
                        <button type="button" className="ghost" onClick={() => keepIdea(i, s.text)}>
                          {t.saveIdea}
                        </button>
                      )}
                    </span>
                  )}
                  <p>
                    {s.text}
                    {s.sources.length > 0 && (
                      <span className="cites">
                        {s.sources.map((n) => {
                          const src = result.sources.find((x) => x.n === n);
                          return src ? (
                            <a key={n} href={`#src-${n}`} title={src.title}>
                              [{n}]
                            </a>
                          ) : null;
                        })}
                      </span>
                    )}
                  </p>
                </div>
              ))}
              {result.sources.length > 0 && (
                <div className="sources">
                  <p className="label small">{t.sources}</p>
                  <ol>
                    {result.sources
                      .filter((src) => result.segments.some((s) => s.sources.includes(src.n)))
                      .map((src) => (
                        <li key={src.n} id={`src-${src.n}`}>
                          <span className="n">[{src.n}]</span>{" "}
                          <a href={`https://doi.org/${src.doi}`} target="_blank" rel="noreferrer">
                            {src.title}
                          </a>{" "}
                          <span className="meta">
                            {src.authors} ({src.year}) · {t[src.kind]}
                            {src.participatory ? ` · ${t.participatory}` : ""}
                          </span>
                        </li>
                      ))}
                  </ol>
                </div>
              )}
              <p className="muted small legend">{t.legend}</p>
            </section>
          )}

          {ideas.length > 0 && (
            <section className="card ideas" aria-labelledby="ideas-title">
              <h2 id="ideas-title">{t.ideas}</h2>
              <p className="muted small">{t.ideasIntro}</p>
              <ul>
                {ideas.map((st) => (
                  <li key={st.idea.id}>
                    <p className="ideaText">{st.idea.text}</p>
                    <p className={`status ${st.status}`}>
                      {fillT(st.status, { rated: st.rated, min: MIN_RATED_RUNS, helped: st.helped })}
                    </p>
                    <div className="ideaRow">
                      <Link href={`/companion?idea=${encodeURIComponent(st.idea.id)}`} className="ghost">
                        {t.tryIdea} →
                      </Link>
                      <button
                        type="button"
                        className="ghost danger"
                        onClick={() => {
                          deleteIdea(window.localStorage, st.idea.id);
                          refreshLocal();
                        }}
                      >
                        {t.delete}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <footer className="foot">
            <p>{t.disclaimer}</p>
            <nav>
              <Link href="/library">{t.navLibrary}</Link>
              <Link href="/companion">{t.navCompanion}</Link>
              <Link href="/">{t.navHome}</Link>
            </nav>
          </footer>
        </main>
      </div>
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #efe9df;
          color: #2c3532;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          line-height: 1.5;
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          max-width: 640px;
          margin: 0 auto;
        }
        .top :global(.brand) {
          color: #2c3532;
          text-decoration: none;
          font-weight: 700;
        }
        .top :global(.brand span) {
          font-weight: 400;
          color: #5c6b66;
        }
        .lang {
          display: flex;
          gap: 4px;
        }
        .lang button {
          min-height: 40px;
          min-width: 44px;
          border: 1px solid #cfc6b8;
          background: transparent;
          color: #3e4a46;
          border-radius: 10px;
          font: inherit;
          font-size: 14px;
        }
        .lang button[aria-pressed="true"] {
          background: #3f5f57;
          border-color: #3f5f57;
          color: #f6f2ea;
        }
        main {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 16px 48px;
        }
        h1 {
          font-size: 28px;
          margin: 8px 0 6px;
        }
        .sub {
          margin: 0 0 14px;
          color: #46524e;
        }
        .card {
          background: #f8f5ef;
          border: 1px solid #ddd4c6;
          border-radius: 16px;
          padding: 16px;
        }
        .label {
          display: block;
          font-weight: 600;
          margin: 0 0 8px;
        }
        .label.small {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6b7772;
          margin-top: 14px;
        }
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #cfc6b8;
          border-radius: 12px;
          padding: 12px;
          font: inherit;
          font-size: 17px;
          background: #fffdf9;
          color: #2c3532;
          resize: vertical;
        }
        .hint {
          display: flex;
          justify-content: flex-end;
          font-size: 13px;
          color: #6b7772;
          margin: 6px 0 10px;
        }
        .primary {
          min-height: 52px;
          border: 0;
          border-radius: 14px;
          background: #3f5f57;
          color: #f6f2ea;
          font: inherit;
          font-size: 17px;
          font-weight: 600;
        }
        .primary:disabled {
          opacity: 0.55;
        }
        .wide {
          width: 100%;
        }
        .examples {
          display: grid;
          gap: 8px;
        }
        .example {
          text-align: left;
          min-height: 46px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #ddd4c6;
          background: #fffdf9;
          color: #2c3532;
          font: inherit;
          font-size: 15px;
        }
        .error {
          color: #8a3b2e;
        }
        .muted {
          color: #6b7772;
        }
        .small {
          font-size: 13px;
        }
        .answer {
          margin-top: 16px;
        }
        .notice {
          font-size: 14px;
          color: #7a5a2a;
          background: #fbf3e6;
          border-radius: 12px;
          padding: 8px 12px;
        }
        .seg {
          background: #f8f5ef;
          border: 1px solid #ddd4c6;
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 10px;
        }
        .seg.safety {
          background: #fbf0e3;
          border-color: #e2c9a4;
        }
        .seg p {
          margin: 6px 0 0;
          font-size: 17px;
        }
        .lab {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          border-radius: 999px;
          padding: 3px 10px;
        }
        .lab.science {
          background: #dfe7e1;
          color: #2f4d45;
        }
        .lab.practice {
          background: #ebe5da;
          color: #4f5b57;
        }
        .lab.person {
          background: #e4e9f4;
          color: #2f3f5f;
        }
        .lab.idea {
          background: #f1e3cd;
          color: #6d4d1f;
        }
        .lab.safety {
          background: #9a4a36;
          color: #fff8f2;
        }
        .cites a {
          margin-left: 6px;
          color: #3f5f57;
          font-size: 14px;
          text-decoration: none;
          font-weight: 600;
        }
        .sources ol {
          padding: 0;
          margin: 0;
          list-style: none;
        }
        .sources li {
          font-size: 14px;
          margin-bottom: 8px;
        }
        .sources a {
          color: #3f5f57;
        }
        .n {
          font-weight: 700;
        }
        .meta {
          color: #6b7772;
        }
        .legend {
          margin-top: 14px;
        }
        .ideaActions {
          float: right;
        }
        .ideas {
          margin-top: 16px;
        }
        .ideas h2 {
          font-size: 20px;
          margin: 0 0 4px;
        }
        .ideas ul {
          list-style: none;
          padding: 0;
          margin: 10px 0 0;
        }
        .ideas li {
          border-top: 1px solid #e6dfd3;
          padding: 10px 0;
        }
        .ideaText {
          margin: 0 0 4px;
          font-size: 15px;
        }
        .status {
          margin: 0 0 6px;
          font-size: 13px;
          color: #6b7772;
        }
        .status.person_data {
          color: #2f3f5f;
          font-weight: 600;
        }
        .status.not_helping {
          color: #8a3b2e;
        }
        .ideaRow {
          display: flex;
          gap: 8px;
        }
        .ideas :global(.ghost),
        .ideaActions :global(.ghost) {
          display: inline-block;
          min-height: 36px;
          line-height: 36px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid #cfc6b8;
          background: transparent;
          color: #3f5f57;
          font: inherit;
          font-size: 14px;
          text-decoration: none;
        }
        .danger {
          color: #8a3b2e !important;
          border-color: #e2c0b5 !important;
        }
        .foot {
          margin-top: 20px;
          font-size: 13px;
          color: #6b7772;
        }
        .foot nav {
          display: flex;
          gap: 14px;
          margin-top: 8px;
        }
        .foot :global(a) {
          color: #3f5f57;
        }
      `}</style>
    </>
  );
}
