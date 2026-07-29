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
        seoTitle: "Allvarlig händelse — Neuroljus",
        seoDesc:
          "Lokalt vittnesmål för Lex Sarah / IVO / juridisk hjälp. Ingen kamera. Ingen AI-detektion.",
        platform: "Serious Incident",
        kicker: "Lokal · privat · skydda först",
        heroTitle: "Strukturera det du såg — sedan rapportera",
        heroSub:
          "När personal knuffar, försummar, låter självskada fortsätta eller förnedrar: skriv vad som hände. Spara lokalt. Exportera text eller JSON till Lex Sarah, IVO eller advokat.",
        frame:
          "Du som vårdgivare eller personal med anmälningsplikt har behörighet — och ofta skyldighet — att hantera den här informationen. Neuroljus hjälper dig strukturera vittnesmålet lokalt under din auktoritet. Det upptäcker inte våld via kamera och ersätter inte IVO som institution. Våld och försummelse är aldrig vård.",
        formTitle: "Ny allvarlig händelse",
        kind: "Typ",
        when: "När (ungefär)",
        setting: "Plats / miljö",
        who: "Vem gjorde vad",
        others: "Andra närvarande",
        after: "Vad personen gjorde efteråt",
        protect: "Vad du gjorde för att skydda",
        speech: "Upprepade fraser (som de sades)",
        uncertainty: "Vad du inte kan veta",
        reporting: "Rapportering (Lex Sarah / IVO / advokat — planerat eller gjort)",
        save: "Spara lokalt",
        saved: "Sparad i den här webbläsaren",
        listTitle: "Dina händelser",
        empty: "Inga händelser ännu. Börja med det du just bevittnade.",
        delete: "Ta bort",
        exportTxt: "Exportera .txt",
        exportJson: "Exportera .json",
        ctaObs: "Observation Method",
        ctaPat: "Mönsteranteckningar",
        disclaimer:
          "Skydda personen först. Dokumentera under din behörighet. Följ anmälningsplikt. Neuroljus strukturerar lokalt — det ersätter inte IVO eller advokat som institution, och det upptäcker inte våld via kamera.",
      },
      en: {
        seoTitle: "Serious Incident — Neuroljus",
        seoDesc:
          "Local witness note for Lex Sarah / IVO / legal counsel. No camera. No AI detection.",
        platform: "Serious Incident",
        kicker: "Local · private · protect first",
        heroTitle: "Structure what you saw — then report",
        heroSub:
          "When staff push, neglect, allow self-harm to continue, or demean: write what happened. Save locally. Export text or JSON for Lex Sarah, IVO, or a lawyer.",
        frame:
          "As a caregiver or staff member with a reporting duty, you are authorized — and often obligated — to handle this information. Neuroljus helps you structure the witness note locally under your authority. It does not detect violence via camera and does not replace IVO as an institution. Violence and neglect are never care.",
        formTitle: "New serious incident",
        kind: "Kind",
        when: "When (approx.)",
        setting: "Setting",
        who: "Who did what",
        others: "Others present",
        after: "What the person did afterward",
        protect: "What you did to protect",
        speech: "Repeated phrases (as spoken)",
        uncertainty: "What you cannot know",
        reporting: "Reporting (Lex Sarah / IVO / lawyer — planned or done)",
        save: "Save locally",
        saved: "Saved in this browser",
        listTitle: "Your incidents",
        empty: "No incidents yet. Start with what you just witnessed.",
        delete: "Delete",
        exportTxt: "Export .txt",
        exportJson: "Export .json",
        ctaObs: "Observation Method",
        ctaPat: "Pattern Notebook",
        disclaimer:
          "Protect the person first. Document under your authorization. Follow reporting duties. Neuroljus structures locally — it does not replace IVO or a lawyer as institutions, and it does not detect violence via camera.",
      },
      es: {
        seoTitle: "Incidente grave — Neuroljus",
        seoDesc:
          "Testimonio local para Lex Sarah / IVO / abogado. Sin cámara. Sin detección por IA.",
        platform: "Serious Incident",
        kicker: "Local · privado · proteger primero",
        heroTitle: "Estructura lo que viste — luego reporta",
        heroSub:
          "Cuando el personal empuja, negligencia, deja continuar la autoagresión o humilla: escribe lo que pasó. Guarda localmente. Exporta texto o JSON para Lex Sarah, IVO o un abogado.",
        frame:
          "Como cuidadora o personal con deber de denuncia, estás autorizada — y a menudo obligada — a manejar esta información. Neuroljus te ayuda a estructurar el testimonio en local bajo tu autoridad. No detecta violencia por cámara y no sustituye a IVO como institución. Violencia y negligencia nunca son cuidado.",
        formTitle: "Nuevo incidente grave",
        kind: "Tipo",
        when: "Cuándo (aprox.)",
        setting: "Lugar / entorno",
        who: "Quién hizo qué",
        others: "Otras personas presentes",
        after: "Qué hizo la persona después",
        protect: "Qué hiciste tú para proteger",
        speech: "Frases repetidas (como se dijeron)",
        uncertainty: "Lo que no puedes saber",
        reporting: "Reporte (Lex Sarah / IVO / abogado — planeado o hecho)",
        save: "Guardar localmente",
        saved: "Guardado en este navegador",
        listTitle: "Tus incidentes",
        empty: "Aún no hay incidentes. Empieza con lo que acabas de presenciar.",
        delete: "Eliminar",
        exportTxt: "Exportar .txt",
        exportJson: "Exportar .json",
        ctaObs: "Observation Method",
        ctaPat: "Cuaderno de patrones",
        disclaimer:
          "Protege a la persona primero. Documenta bajo tu autorización. Cumple el deber de denuncia. Neuroljus estructura en local — no sustituye a IVO ni al abogado como institución, y no detecta violencia por cámara.",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#09090b" />
      </Head>

      <div className="page">
        <div className="statusbar" aria-hidden="true">
          <span>
            neuroljus://local · <b>serious_incident_v0</b> · network=off · camera=off
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

          <p className="disclaimer">{copy.disclaimer}</p>
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
        select {
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
        @media (max-width: 720px) {
          .statusbar {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
