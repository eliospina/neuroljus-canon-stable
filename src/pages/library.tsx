import Head from "next/head";
import Link from "next/link";
import type { GetStaticProps } from "next";
import { useCallback, useMemo, useState } from "react";
import { useLang, type Lang } from "@/components/SiteLayout";
import { LIBRARY_DOCS, docLink, type EvidenceKind } from "@/lib/library";
import { TOPIC_LABELS, TOPIC_ORDER, type TopicId } from "@/lib/library/topics";

/** What the page needs per document (abstracts stay on the server). */
type Item = {
  id: string;
  doi: string;
  /** DOI link, or the guideline / book link when there is no DOI. */
  link: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  kind: EvidenceKind;
  participatory: boolean;
  open: boolean;
  license: string;
  topics: TopicId[];
  hasSheet: boolean;
  seed: { claim: { es: string; en: string; sv: string }; supports: { es: string; en: string; sv: string }; doesNotSupport: { es: string; en: string; sv: string } } | null;
};

type Props = { items: Item[]; counts: { total: number; strong: number; participatory: number; sheets: number; seeds: number } };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const items: Item[] = LIBRARY_DOCS.map((d) => ({
    id: d.id,
    doi: d.doi,
    link: docLink(d),
    title: d.title,
    authors: d.authors.split(",")[0].trim() + (d.authors.includes(",") ? " et al." : ""),
    journal: d.journal,
    year: d.year,
    kind: d.kind,
    participatory: d.participatory,
    open: d.openText,
    license: d.license === "unknown" ? "" : d.license,
    topics: d.topics,
    hasSheet: d.sheet !== null,
    seed: d.seed ?? null,
  }));
  return {
    props: {
      items,
      counts: {
        total: items.length,
        strong: items.filter((i) => i.kind === "systematic_review" || i.kind === "meta_analysis").length,
        participatory: items.filter((i) => i.participatory).length,
        sheets: items.filter((i) => i.hasSheet).length,
        seeds: items.filter((i) => i.seed).length,
      },
    },
  };
};

const T: Record<Lang, Record<string, string>> = {
  es: {
    title: "Biblioteca de autismo",
    sub: "Estudios de acceso abierto, verificados por código: DOI comprobado en Crossref, licencia registrada, retractados excluidos. Lo que NeuroLjus usa para fundamentar sus respuestas.",
    stats: "{total} estudios · {strong} revisiones sistemáticas y metaanálisis · {participatory} con participación de personas autistas · {seeds} hallazgos clave · {sheets} fichas prácticas",
    seeds: "Hallazgos clave",
    seedsSub: "Elegidos a mano, verificados, con lo que apoyan y lo que no.",
    supports: "Apoya",
    not: "No apoya",
    search: "Buscar en títulos",
    all: "Todos los temas",
    sheet: "Para un cuidador mañana por la mañana",
    noSheet: "Solo metadatos y enlace (licencia no abierta).",
    sheetPending: "Ficha práctica pendiente.",
    metadataOnly: "solo metadatos y enlace",
    participatory: "con personas autistas",
    systematic_review: "revisión sistemática",
    meta_analysis: "metaanálisis",
    review: "revisión",
    study: "estudio",
    trial: "ensayo controlado",
    guideline: "guía clínica",
    expert_practice: "práctica de experto",
    results: "resultados",
    open: "Abrir estudio",
    sources: "Fuentes y licencias",
    disclaimer: "NeuroLjus no diagnostica ni receta. Si hay peligro, llama al número de emergencias de tu país (112 en Suecia y la UE). Dudas médicas no urgentes en Suecia: 1177.",
    navAsk: "Pregunta a NeuroLjus",
    navCompanion: "Companion",
    navHome: "Inicio",
  },
  en: {
    title: "Autism library",
    sub: "Open-access studies, verified by code: DOI checked in Crossref, licence recorded, retracted papers excluded. What NeuroLjus uses to ground its answers.",
    stats: "{total} studies · {strong} systematic reviews and meta-analyses · {participatory} with autistic participation · {seeds} key findings · {sheets} practical sheets",
    seeds: "Key findings",
    seedsSub: "Hand-picked, verified, with what they support and what they do not.",
    supports: "Supports",
    not: "Does not support",
    search: "Search titles",
    all: "All topics",
    sheet: "For a caregiver tomorrow morning",
    noSheet: "Metadata and link only (licence not open).",
    sheetPending: "Practical sheet pending.",
    metadataOnly: "metadata and link only",
    participatory: "with autistic people",
    systematic_review: "systematic review",
    meta_analysis: "meta-analysis",
    review: "review",
    study: "study",
    trial: "controlled trial",
    guideline: "clinical guideline",
    expert_practice: "expert practice",
    results: "results",
    open: "Open study",
    sources: "Sources and licences",
    disclaimer: "NeuroLjus does not diagnose or prescribe. If there is danger, call your country's emergency number (112 in Sweden and the EU). Non-urgent medical questions in Sweden: 1177.",
    navAsk: "Ask NeuroLjus",
    navCompanion: "Companion",
    navHome: "Home",
  },
  sv: {
    title: "Autismbibliotek",
    sub: "Studier med öppen tillgång, verifierade av kod: DOI kontrollerad i Crossref, licens registrerad, tillbakadragna artiklar uteslutna. Det NeuroLjus grundar sina svar på.",
    stats: "{total} studier · {strong} systematiska översikter och metaanalyser · {participatory} med autistiskt deltagande · {seeds} nyckelfynd · {sheets} praktiska blad",
    seeds: "Nyckelfynd",
    seedsSub: "Handplockade, verifierade, med vad de stödjer och inte stödjer.",
    supports: "Stödjer",
    not: "Stödjer inte",
    search: "Sök i titlar",
    all: "Alla ämnen",
    sheet: "För en vårdgivare i morgon bitti",
    noSheet: "Endast metadata och länk (licensen är inte öppen).",
    sheetPending: "Praktiskt blad kommer.",
    metadataOnly: "endast metadata och länk",
    participatory: "med autistiska personer",
    systematic_review: "systematisk översikt",
    meta_analysis: "metaanalys",
    review: "översikt",
    study: "studie",
    trial: "kontrollerad studie",
    guideline: "klinisk riktlinje",
    expert_practice: "expertpraktik",
    results: "resultat",
    open: "Öppna studien",
    sources: "Källor och licenser",
    disclaimer: "NeuroLjus diagnostiserar inte och förskriver inte. Vid fara, ring ditt lands nödnummer (112 i Sverige och EU). Icke-akuta medicinska frågor i Sverige: 1177.",
    navAsk: "Fråga NeuroLjus",
    navCompanion: "Companion",
    navHome: "Hem",
  },
};

function fill(t: string, v: Record<string, number | string>) {
  return t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));
}

export default function LibraryPage({ items, counts }: Props) {
  const [lang, setLang] = useLang("en");
  const t = T[lang];
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<TopicId | "all">("all");
  const [sheets, setSheets] = useState<Record<string, string>>({});

  const loadSheet = useCallback(
    async (id: string) => {
      const key = `${id}:${lang}`;
      if (sheets[key]) return;
      try {
        const r = await fetch(`/api/library-sheet?id=${encodeURIComponent(id)}&lang=${lang}`);
        const j = (await r.json()) as { ok: boolean; sheet: string | null };
        setSheets((prev) => ({ ...prev, [key]: j.sheet || "…" }));
      } catch {
        /* offline: the link to the study still works */
      }
    },
    [lang, sheets]
  );

  const seeds = useMemo(() => items.filter((i) => i.seed), [items]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter((i) => topic === "all" || i.topics.includes(topic))
      .filter((i) => !needle || `${i.title} ${i.seed?.claim[lang] ?? ""}`.toLowerCase().includes(needle))
      .sort((a, b) => (b.seed ? 1 : 0) - (a.seed ? 1 : 0) || rank(b.kind) - rank(a.kind) || b.year - a.year);
  }, [items, q, topic, lang]);

  return (
    <>
      <Head>
        <title>Autism library — NeuroLjus</title>
        <meta
          name="description"
          content="Open-access autism research verified by code (DOI, licence, retraction) with practical sheets for caregivers in Spanish, English and Swedish."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#09090b" />
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
          <p className="stats">{fill(t.stats, counts)}</p>

          <section className="seeds" aria-labelledby="seeds-title">
            <h2 id="seeds-title">{t.seeds}</h2>
            <p className="muted">{t.seedsSub}</p>
            <ol>
              {seeds.map((s) => (
                <li key={s.id} className="seed">
                  <p className="claim">{s.seed!.claim[lang]}</p>
                  <p className="meta">
                    <span className="kind">{t[s.kind]}</span>
                    {s.participatory && <span className="kind part">{t.participatory}</span>}
                    <a href={s.link} target="_blank" rel="noreferrer">
                      {s.authors} ({s.year}) · {s.journal}
                    </a>
                  </p>
                  <p className="limits">
                    <b>{t.supports}:</b> {s.seed!.supports[lang]} <b>{t.not}:</b> {s.seed!.doesNotSupport[lang]}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="browse" aria-label={t.search}>
            <div className="controls">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.search}
                aria-label={t.search}
              />
              <select value={topic} onChange={(e) => setTopic(e.target.value as TopicId | "all")} aria-label={t.all}>
                <option value="all">{t.all}</option>
                {TOPIC_ORDER.map((id) => (
                  <option key={id} value={id}>
                    {TOPIC_LABELS[id][lang]} ({items.filter((i) => i.topics.includes(id)).length})
                  </option>
                ))}
              </select>
            </div>
            <p className="muted">
              {filtered.length} {t.results}
            </p>
            <ul className="list">
              {filtered.slice(0, 200).map((i) => (
                <li key={i.id}>
                  <h3>{i.title}</h3>
                  <p className="meta">
                    <span className="kind">{t[i.kind]}</span>
                    {i.participatory && <span className="kind part">{t.participatory}</span>}
                    <span>
                      {i.authors} ({i.year}) · {i.journal}
                    </span>
                  </p>
                  {i.hasSheet ? (
                    <details onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && void loadSheet(i.id)}>
                      <summary>{t.sheet}</summary>
                      <p>{sheets[`${i.id}:${lang}`] ?? "…"}</p>
                    </details>
                  ) : (
                    <p className="muted small">{i.open ? t.sheetPending : t.noSheet}</p>
                  )}
                  <p className="links">
                    <a href={i.link} target="_blank" rel="noreferrer">
                      {t.open} →
                    </a>
                    {i.doi && <span className="doi">{i.doi}</span>}
                    <span className="lic">{i.license ? i.license.toUpperCase() : t.metadataOnly}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <footer className="foot">
            <p>{t.disclaimer}</p>
            <nav>
              <a href="https://github.com/eliospina/neuroljus-canon-stable/blob/main/docs/library/SOURCES.md" target="_blank" rel="noreferrer">
                {t.sources}
              </a>
              <Link href="/companion">{t.navCompanion}</Link>
              <Link href="/">{t.navHome}</Link>
            </nav>
          </footer>
        </main>
      </div>
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #09090b;
          color: #fafafa;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          line-height: 1.5;
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          max-width: 760px;
          margin: 0 auto;
        }
        .top :global(.brand) {
          color: #fafafa;
          text-decoration: none;
          font-weight: 700;
        }
        .top :global(.brand span) {
          font-weight: 400;
          color: #a1a1aa;
        }
        .lang {
          display: flex;
          gap: 4px;
        }
        .lang button {
          min-height: 40px;
          min-width: 44px;
          border: 1px solid #3f3f46;
          background: transparent;
          color: #d4d4d8;
          border-radius: 6px;
          font: inherit;
          font-size: 14px;
        }
        .lang button[aria-pressed="true"] {
          background: #3ecf9a;
          border-color: #3ecf9a;
          color: #09090b;
        }
        main {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 16px 48px;
        }
        h1 {
          font-size: 28px;
          margin: 8px 0 8px;
        }
        h2 {
          font-size: 20px;
          margin: 24px 0 4px;
        }
        h3 {
          font-size: 16px;
          margin: 0 0 4px;
          line-height: 1.35;
        }
        .sub {
          margin: 0 0 8px;
          color: #d4d4d8;
        }
        .stats {
          font-size: 14px;
          color: #3ecf9a;
          background: rgba(62, 207, 154, 0.08);
          border-radius: 8px;
          padding: 8px 12px;
        }
        .muted {
          color: #a1a1aa;
          font-size: 14px;
        }
        .small {
          font-size: 13px;
        }
        ol,
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .seed,
        .list li {
          background: #111114;
          border: 1px solid #27272a;
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 10px;
        }
        .claim {
          font-size: 17px;
          font-weight: 600;
          margin: 0 0 6px;
        }
        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 10px;
          align-items: center;
          font-size: 13px;
          color: #d4d4d8;
          margin: 0 0 6px;
        }
        .meta a {
          color: #3ecf9a;
        }
        .kind {
          background: #18181b;
          border-radius: 6px;
          padding: 2px 9px;
        }
        .kind.part {
          background: rgba(124, 227, 247, 0.08);
          color: #7ce3f7;
        }
        .limits {
          font-size: 14px;
          margin: 0;
          color: #d4d4d8;
        }
        .limits b {
          color: #fafafa;
        }
        .controls {
          display: grid;
          gap: 8px;
          margin: 20px 0 6px;
        }
        input,
        select {
          min-height: 46px;
          border: 1px solid #3f3f46;
          border-radius: 8px;
          padding: 0 12px;
          font: inherit;
          font-size: 16px;
          background: #0c0c0e;
          color: #fafafa;
        }
        details summary {
          cursor: pointer;
          color: #3ecf9a;
          font-weight: 600;
          font-size: 14px;
        }
        details p {
          margin: 6px 0 0;
          font-size: 15px;
        }
        .links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          margin: 8px 0 0;
          font-size: 13px;
        }
        .links a {
          color: #3ecf9a;
        }
        .doi {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .lic {
          color: #a1a1aa;
        }
        .foot {
          margin-top: 24px;
          font-size: 13px;
          color: #a1a1aa;
        }
        .foot nav {
          display: flex;
          gap: 14px;
          margin-top: 8px;
        }
        .foot :global(a) {
          color: #3ecf9a;
        }
        @media (min-width: 600px) {
          .controls {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </>
  );
}

function rank(k: EvidenceKind): number {
  return k === "meta_analysis" ? 4 : k === "systematic_review" || k === "guideline" ? 3 : k === "trial" ? 2 : k === "review" ? 1 : 0;
}
