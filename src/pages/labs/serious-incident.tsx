import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  INCIDENT_KIND_LABELS,
  addSeriousIncident,
  deleteSeriousIncident,
  formatIncidentExportJson,
  formatIncidentExportText,
  readSeriousIncidents,
  type IncidentKind,
  type SeriousIncident,
} from "@/lib/careIncidents/localStore";
import { REPORTING_ADAPTER_CONFIG } from "@/lib/careIncidents/reportingHorizon";

type Lang = "sv" | "en" | "es";

const kinds: IncidentKind[] = [
  "violence",
  "psychological",
  "neglect",
  "self_harm_allowed",
  "speech_cycle",
  "other",
];

const emptyForm = {
  kind: "violence" as IncidentKind,
  jurisdiction: "",
  whenApprox: "",
  setting: "",
  whoWhat: "",
  othersPresent: "",
  personAfter: "",
  protectionActs: "",
  speechCycles: "",
  uncertainty: "",
  reporting: "",
};

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SeriousIncidentLab() {
  const [lang, setLang] = useState<Lang>("en");
  const [incidents, setIncidents] = useState<SeriousIncident[]>([]);
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
    setIncidents(readSeriousIncidents());
  }, []);

  const T = useMemo(
    () => ({
      sv: {
        seoTitle: "Witness notes — Neuroljus",
        seoDesc:
          "Intern struktur för vittnesanteckningar. Lokal export. Ingen kamera.",
        platform: "Witness notes · internal",
        kicker: "Intern · lokal · framtida rapportering avstängd",
        heroTitle: "Strukturera det du såg",
        heroSub:
          "Lokal anteckning och export. Inga nätverksalarm i den här versionen. Framtida rapporterings-/rapportlager finns i koden men är avstängda.",
        frame:
          "Detta yta är intern infrastruktur — inte en offentlig produktmodul. Du behåller behörigheten. Neuroljus upptäcker inte våld via kamera.",
        formTitle: "Ny anteckning",
        kind: "Typ",
        jurisdiction: "Jurisdiktion / land (valfritt)",
        when: "När (ungefär)",
        setting: "Plats / miljö",
        who: "Vem gjorde vad",
        others: "Andra närvarande",
        after: "Vad personen gjorde efteråt",
        protect: "Vad du gjorde för att skydda",
        speech: "Upprepade fraser (som de sades)",
        uncertainty: "Vad du inte kan veta",
        reporting: "Eskalering / uppföljning (valfritt)",
        save: "Spara lokalt",
        saved: "Sparad i den här webbläsaren",
        listTitle: "Dina anteckningar",
        empty: "Inga anteckningar ännu.",
        delete: "Ta bort",
        exportTxt: "Exportera .txt",
        exportJson: "Exportera .json",
        ctaObs: "Observation Method",
        ctaPat: "Mönsteranteckningar",
        ctaMem: "Omsorgsminne",
        disclaimer:
          "Lokal struktur. Inga automatiska larm. Framtida adapter för rapporter/alarmer kräver uttrycklig aktivering.",
      },
      en: {
        seoTitle: "Witness notes — Neuroljus",
        seoDesc: "Internal witness-note structure. Local export. No camera.",
        platform: "Witness notes · internal",
        kicker: "Internal · local · future reporting off",
        heroTitle: "Structure what you saw",
        heroSub:
          "Local note and export. No network alarms in this version. Future reporting/report layers exist in code but stay disabled.",
        frame:
          "This surface is internal infrastructure — not a public product module. You keep authority. Neuroljus does not detect violence via camera.",
        formTitle: "New note",
        kind: "Kind",
        jurisdiction: "Jurisdiction / country (optional)",
        when: "When (approx.)",
        setting: "Setting",
        who: "Who did what",
        others: "Others present",
        after: "What the person did afterward",
        protect: "What you did to protect",
        speech: "Repeated phrases (as spoken)",
        uncertainty: "What you cannot know",
        reporting: "Escalation / follow-up (optional)",
        save: "Save locally",
        saved: "Saved in this browser",
        listTitle: "Your notes",
        empty: "No notes yet.",
        delete: "Delete",
        exportTxt: "Export .txt",
        exportJson: "Export .json",
        ctaObs: "Observation Method",
        ctaPat: "Pattern Notebook",
        ctaMem: "Care Memory",
        disclaimer:
          "Local structure. No automatic alerts. Future adapters for reports/alarms require explicit activation.",
      },
      es: {
        seoTitle: "Notas de testimonio — Neuroljus",
        seoDesc: "Estructura interna de testimonio. Export local. Sin cámara.",
        platform: "Witness notes · internal",
        kicker: "Interno · local · reporte futuro apagado",
        heroTitle: "Estructura lo que viste",
        heroSub:
          "Nota y export locales. Sin alarmas de red en esta versión. Capas futuras de reporte existen en código pero están desactivadas.",
        frame:
          "Esta superficie es infraestructura interna — no un módulo público. Tú mantienes la autoridad. Neuroljus no detecta violencia por cámara.",
        formTitle: "Nueva nota",
        kind: "Tipo",
        jurisdiction: "Jurisdicción / país (opcional)",
        when: "Cuándo (aprox.)",
        setting: "Lugar / entorno",
        who: "Quién hizo qué",
        others: "Otras personas presentes",
        after: "Qué hizo la persona después",
        protect: "Qué hiciste tú para proteger",
        speech: "Frases repetidas (como se dijeron)",
        uncertainty: "Lo que no puedes saber",
        reporting: "Escalada / seguimiento (opcional)",
        save: "Guardar localmente",
        saved: "Guardado en este navegador",
        listTitle: "Tus notas",
        empty: "Aún no hay notas.",
        delete: "Eliminar",
        exportTxt: "Exportar .txt",
        exportJson: "Exportar .json",
        ctaObs: "Observation Method",
        ctaPat: "Cuaderno de patrones",
        ctaMem: "Memoria de cuidado",
        disclaimer:
          "Estructura local. Sin alertas automáticas. Adaptadores futuros de informes/alarmas requieren activación explícita.",
      },
    }),
    []
  );

  const copy = T[lang];

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.whoWhat.trim() && !form.setting.trim()) return;
    const next = addSeriousIncident({
      kind: form.kind,
      jurisdiction: form.jurisdiction.trim(),
      whenApprox: form.whenApprox.trim(),
      setting: form.setting.trim(),
      whoWhat: form.whoWhat.trim(),
      othersPresent: form.othersPresent.trim(),
      personAfter: form.personAfter.trim(),
      protectionActs: form.protectionActs.trim(),
      speechCycles: form.speechCycles.trim(),
      uncertainty: form.uncertainty.trim(),
      reporting: form.reporting.trim(),
    });
    setIncidents(next);
    setForm({ ...emptyForm, kind: form.kind });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2200);
  }

  function onDelete(id: string) {
    setIncidents(deleteSeriousIncident(id));
  }

  function onExportTxt(incident: SeriousIncident) {
    downloadBlob(
      `${incident.id}.txt`,
      formatIncidentExportText(incident, lang),
      "text/plain;charset=utf-8"
    );
  }

  function onExportJson(incident: SeriousIncident) {
    downloadBlob(
      `${incident.id}.json`,
      formatIncidentExportJson(incident),
      "application/json;charset=utf-8"
    );
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
            neuroljus://internal · <b>witness_notes_v0</b> · reporting_adapters=off · network=off
          </span>
          <span>local export only</span>
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
            <Link href="/observation-method">Observation</Link>
            <Link href="/labs/pattern-notebook">Patterns</Link>
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
            <Link className="cta" href="/observation-method">
              {copy.ctaObs}
            </Link>
            <Link className="cta ghost" href="/labs/pattern-notebook">
              {copy.ctaPat}
            </Link>
            <Link className="cta ghost" href="/labs/care-memory">
              {copy.ctaMem}
            </Link>
          </div>

          <section className="panel" aria-labelledby="form-title">
            <h2 id="form-title">{copy.formTitle}</h2>
            <form onSubmit={onSubmit}>
              <label>
                {copy.kind}
                <select
                  value={form.kind}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kind: e.target.value as IncidentKind }))
                  }
                >
                  {kinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {INCIDENT_KIND_LABELS[kind][lang]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {copy.jurisdiction}
                <input
                  value={form.jurisdiction}
                  onChange={(e) => setForm((f) => ({ ...f, jurisdiction: e.target.value }))}
                  placeholder="Sweden · Colombia · …"
                />
              </label>
              <label>
                {copy.when}
                <textarea
                  rows={2}
                  value={form.whenApprox}
                  onChange={(e) => setForm((f) => ({ ...f, whenApprox: e.target.value }))}
                />
              </label>
              <label>
                {copy.setting}
                <textarea
                  rows={2}
                  value={form.setting}
                  onChange={(e) => setForm((f) => ({ ...f, setting: e.target.value }))}
                />
              </label>
              <label>
                {copy.who}
                <textarea
                  required
                  rows={3}
                  value={form.whoWhat}
                  onChange={(e) => setForm((f) => ({ ...f, whoWhat: e.target.value }))}
                />
              </label>
              <label>
                {copy.others}
                <textarea
                  rows={2}
                  value={form.othersPresent}
                  onChange={(e) => setForm((f) => ({ ...f, othersPresent: e.target.value }))}
                />
              </label>
              <label>
                {copy.after}
                <textarea
                  rows={2}
                  value={form.personAfter}
                  onChange={(e) => setForm((f) => ({ ...f, personAfter: e.target.value }))}
                />
              </label>
              <label>
                {copy.protect}
                <textarea
                  rows={2}
                  value={form.protectionActs}
                  onChange={(e) => setForm((f) => ({ ...f, protectionActs: e.target.value }))}
                />
              </label>
              <label>
                {copy.speech}
                <textarea
                  rows={2}
                  value={form.speechCycles}
                  onChange={(e) => setForm((f) => ({ ...f, speechCycles: e.target.value }))}
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
              <label>
                {copy.reporting}
                <textarea
                  rows={2}
                  value={form.reporting}
                  onChange={(e) => setForm((f) => ({ ...f, reporting: e.target.value }))}
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
            {incidents.length === 0 ? (
              <p className="empty">{copy.empty}</p>
            ) : (
              <ul className="notes">
                {incidents.map((incident) => (
                  <li key={incident.id}>
                    <div className="noteHead">
                      <time dateTime={incident.createdAt}>
                        {new Date(incident.createdAt).toLocaleString()}
                      </time>
                      <span className="tag">{INCIDENT_KIND_LABELS[incident.kind][lang]}</span>
                      <button type="button" className="del" onClick={() => onDelete(incident.id)}>
                        {copy.delete}
                      </button>
                    </div>
                    <p>
                      <strong>{incident.whoWhat}</strong>
                    </p>
                    {incident.setting && <p>{incident.setting}</p>}
                    {incident.speechCycles && <p className="muted">“{incident.speechCycles}”</p>}
                    <div className="exportRow">
                      <button type="button" className="exportBtn" onClick={() => onExportTxt(incident)}>
                        {copy.exportTxt}
                      </button>
                      <button
                        type="button"
                        className="exportBtn ghost"
                        onClick={() => onExportJson(incident)}
                      >
                        {copy.exportJson}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="disclaimer">
            {copy.disclaimer}
            {!REPORTING_ADAPTER_CONFIG.enabled && (
              <span className="mutedBlock"> · adapters=off</span>
            )}
          </p>
        </main>
      </div>

      <style jsx>{`
        .page {
          --bg: #09090b;
          --ink: #f4f4f5;
          --muted: #a1a1aa;
          --line: rgba(255, 255, 255, 0.1);
          --accent: #fca5a5;
          --panel: rgba(24, 24, 27, 0.92);
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 15% -10%, rgba(252, 165, 165, 0.1), transparent),
            radial-gradient(ellipse 50% 40% at 90% 0%, rgba(125, 211, 252, 0.06), transparent),
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
          font-size: clamp(1.8rem, 4vw, 2.55rem);
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
          border: 1px solid rgba(252, 165, 165, 0.45);
          color: var(--ink);
          text-decoration: none;
          font-size: 0.88rem;
          background: rgba(252, 165, 165, 0.08);
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
        textarea,
        select,
        input {
          width: 100%;
          resize: vertical;
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
          color: #450a0a;
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
          border: 1px solid rgba(252, 165, 165, 0.35);
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
        .exportRow {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-top: 0.55rem;
        }
        .exportBtn {
          background: transparent;
          border: 1px solid rgba(252, 165, 165, 0.4);
          color: var(--ink);
          cursor: pointer;
          font-size: 0.75rem;
          padding: 0.3rem 0.55rem;
        }
        .exportBtn.ghost {
          border-color: var(--line);
          color: var(--muted);
        }
        .disclaimer {
          font-size: 0.82rem;
          margin-top: 1.5rem;
        }
        .mutedBlock {
          color: var(--muted);
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
