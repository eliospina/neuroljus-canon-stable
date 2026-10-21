import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SiteLayout, { useLang } from "@/components/SiteLayout";
import ListInput from "@/components/ficha/ListInput";
import { FICHA_COPY } from "@/lib/ficha/copy";
import { cardOf, encodeCard, rankHelps, type Ficha } from "@/lib/ficha/model";
import { deleteFicha, readFicha, saveFicha } from "@/lib/ficha/localStore";

/**
 * "Mateo, hoy": one person, four verbs, and the record that grows underneath.
 * Every change is saved at once to this browser. Design: docs/strategy/ficha-de-la-persona.md.
 */

const VERBS = [
  { key: "talk", href: "/linea" },
  { key: "look", href: "/labs/nl-vision" },
  { key: "act", href: "/companion" },
  { key: "note", href: "/labs/pattern-notebook" },
] as const;

export default function FichaPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";
  const [lang, setLang] = useLang("es");
  const copy = FICHA_COPY[lang];
  const [f, setF] = useState<Ficha | null | undefined>(undefined);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [sign, setSign] = useState("");
  const [meaning, setMeaning] = useState("");
  const [help, setHelp] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const found = readFicha(id);
    setF(found);
    if (found) setLang(found.lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, id]);

  const update = (patch: Partial<Ficha>) => {
    if (!f) return;
    const next = saveFicha({ ...f, ...patch, lang });
    setF(next);
    setLink("");
  };

  const makeLink = () => {
    if (!f) return;
    const url = `${window.location.origin}/tarjeta#${encodeCard(cardOf(f))}`;
    setLink(url);
    setCopied(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      /* the field below can be copied by hand */
    }
  };

  const exportJson = () => {
    if (!f) return;
    const blob = new Blob([JSON.stringify(f, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `neuroljus-ficha-${f.name || f.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const remove = () => {
    if (!f || !window.confirm(copy.deleteConfirm)) return;
    deleteFicha(f.id);
    router.push("/ficha");
  };

  if (f === undefined) return <SiteLayout lang={lang} onLangChange={setLang}><main className="ficha" /></SiteLayout>;
  if (f === null)
    return (
      <SiteLayout lang={lang} onLangChange={setLang}>
        <main className="ficha missing">
          <p className="kicker">{copy.kicker}</p>
          <h1>{copy.none}</h1>
          <Link href="/ficha" className="nl-cta">
            {copy.create}
          </Link>
        </main>
      </SiteLayout>
    );

  return (
    <SiteLayout lang={lang} onLangChange={setLang}>
      <Head>
        <title>{f.name} — Neuroljus</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="ficha">
        <p className="kicker">
          <Link href="/ficha">{copy.kicker}</Link>
        </p>
        <h1>
          {f.name}, <span>{copy.today}.</span>
        </h1>
        <p className="meta">
          {copy.ages[f.age]}, {copy.speechLine[f.speech]} · {copy.owners[f.owner]}
        </p>

        <nav className="verbs" aria-label={copy.today}>
          {VERBS.map((v) => (
            <Link key={v.key} href={v.href} className="verb">
              <strong>{copy.verbs[v.key]}</strong>
              <span>{copy.verbsSub[v.key]}</span>
            </Link>
          ))}
        </nav>

        <section>
          <h2>{copy.sections.words}</h2>
          <p className="hint">{copy.wordsHint}</p>
          <textarea value={f.inTheirWords} onChange={(e) => update({ inTheirWords: e.target.value })} placeholder={copy.placeholder.words} maxLength={1200} rows={4} />
        </section>

        <section>
          <h2>{copy.sections.signals}</h2>
          <p className="hint">{copy.signalsHint}</p>
          {f.signals.length > 0 && (
            <ul className="rows">
              {f.signals.map((s, i) => (
                <li key={`${s.sign}-${i}`}>
                  <div>
                    <strong>{s.sign}</strong>
                    {s.meaning && <span> → {s.meaning}</span>}
                  </div>
                  <div className="btns">
                    <button type="button" className="count" onClick={() => update({ signals: f.signals.map((x, j) => (j === i ? { ...x, confirmed: x.confirmed + 1 } : x)) })}>
                      +1 {copy.counts.confirmed} ({s.confirmed})
                    </button>
                    <button type="button" className="x" aria-label={copy.remove} onClick={() => update({ signals: f.signals.filter((_, j) => j !== i) })}>
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form
            className="addRow"
            onSubmit={(e) => {
              e.preventDefault();
              if (!sign.trim()) return;
              update({ signals: [...f.signals, { sign: sign.trim(), meaning: meaning.trim(), confirmed: 1 }] });
              setSign("");
              setMeaning("");
            }}
          >
            <input value={sign} onChange={(e) => setSign(e.target.value)} placeholder={copy.placeholder.sign} maxLength={240} />
            <input value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder={copy.placeholder.meaning} maxLength={240} />
            <button type="submit" className="nl-cta-ghost">
              {copy.add}
            </button>
          </form>
        </section>

        <section>
          <h2>{copy.sections.helps}</h2>
          <p className="hint">{copy.helpsHint}</p>
          {f.helps.length > 0 && (
            <ul className="rows">
              {rankHelps(f.helps).map((h) => {
                const i = f.helps.indexOf(h);
                return (
                  <li key={`${h.text}-${i}`} className={h.worsened > h.helped ? "bad" : ""}>
                    <div>
                      <strong>{h.text}</strong>
                      <span>
                        {" "}
                        · {copy.counts.tried} {h.tried} · {copy.counts.helped} {h.helped} · {copy.counts.worsened} {h.worsened}
                      </span>
                    </div>
                    <div className="btns">
                      <button type="button" className="count good" onClick={() => update({ helps: f.helps.map((x, j) => (j === i ? { ...x, tried: x.tried + 1, helped: x.helped + 1 } : x)) })}>
                        + {copy.counts.helped}
                      </button>
                      <button type="button" className="count" onClick={() => update({ helps: f.helps.map((x, j) => (j === i ? { ...x, tried: x.tried + 1, worsened: x.worsened + 1 } : x)) })}>
                        + {copy.counts.worsened}
                      </button>
                      <button type="button" className="x" aria-label={copy.remove} onClick={() => update({ helps: f.helps.filter((_, j) => j !== i) })}>
                        ×
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <form
            className="addRow"
            onSubmit={(e) => {
              e.preventDefault();
              if (!help.trim()) return;
              update({ helps: [...f.helps, { text: help.trim(), tried: 0, helped: 0, worsened: 0 }] });
              setHelp("");
            }}
          >
            <input value={help} onChange={(e) => setHelp(e.target.value)} placeholder={copy.placeholder.help} maxLength={240} />
            <button type="submit" className="nl-cta-ghost">
              {copy.add}
            </button>
          </form>
        </section>

        <section>
          <h2>{copy.sections.avoid}</h2>
          <ListInput items={f.avoid} onChange={(avoid) => update({ avoid })} placeholder={copy.placeholder.avoid} add={copy.add} remove={copy.remove} max={12} />
        </section>

        <section>
          <h2>{copy.sections.crisis}</h2>
          <p className="hint">{copy.crisisHint}</p>
          <ListInput items={f.crisis.steps} onChange={(steps) => update({ crisis: { ...f.crisis, steps } })} placeholder={copy.placeholder.step} add={copy.add} remove={copy.remove} max={3} />
          <input className="field" value={f.crisis.whomToCall} onChange={(e) => update({ crisis: { ...f.crisis, whomToCall: e.target.value } })} placeholder={copy.placeholder.whom} maxLength={240} />
          <p className="hint">{copy.optional}</p>
          <input className="field" value={f.crisis.medication} onChange={(e) => update({ crisis: { ...f.crisis, medication: e.target.value } })} placeholder={copy.placeholder.medication} maxLength={240} />
          <input className="field" value={f.crisis.clinician} onChange={(e) => update({ crisis: { ...f.crisis, clinician: e.target.value } })} placeholder={copy.placeholder.clinician} maxLength={240} />
        </section>

        <section className="handover">
          <h2>{copy.sections.card}</h2>
          <p className="hint">{copy.cardHint}</p>
          <div className="btnRow">
            <button type="button" className="nl-cta" onClick={makeLink}>
              {copy.cardTitle(f.name)}: {copy.cardLink}
            </button>
          </div>
          {link && (
            <div className="linkBox">
              <input readOnly value={link} onFocus={(e) => e.target.select()} />
              <div className="btnRow">
                <button type="button" className="nl-cta-ghost" onClick={copyLink}>
                  {copied ? copy.copied : copy.copyLink}
                </button>
                <a className="nl-cta-ghost" href={link} target="_blank" rel="noreferrer">
                  {copy.openCard}
                </a>
              </div>
            </div>
          )}
        </section>

        <section className="data">
          <h2>{copy.sections.data}</h2>
          <p className="hint">{copy.storedHere}</p>
          <div className="btnRow">
            <button type="button" className="nl-cta-ghost" onClick={exportJson}>
              {copy.exportJson}
            </button>
            <button type="button" className="nl-cta-ghost danger" onClick={remove}>
              {copy.deleteFicha}
            </button>
          </div>
        </section>
      </main>

      <style jsx>{`
        .ficha {
          max-width: 720px;
          margin: 0 auto;
          padding: 56px 20px 120px;
        }
        .missing h1 {
          margin-bottom: 20px;
        }
        .kicker {
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--nl-aurora-a);
          margin: 0 0 12px;
        }
        .kicker :global(a) {
          color: inherit;
          text-decoration: none;
        }
        h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 46px);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        h1 span {
          color: var(--nl-text-dim);
          font-weight: 500;
        }
        .meta {
          margin: 8px 0 24px;
          color: var(--nl-text-dim);
        }
        .verbs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 12px;
        }
        .ficha :global(.verb) {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px 14px;
          border: 1px solid var(--nl-border-strong);
          border-radius: var(--nl-radius);
          background: var(--nl-surface);
          color: var(--nl-text);
          text-decoration: none;
        }
        .ficha :global(.verb strong) {
          font-size: 20px;
          color: var(--nl-aurora-a);
        }
        .ficha :global(.verb span) {
          font-size: 13px;
          color: var(--nl-text-dim);
          line-height: 1.35;
        }
        section {
          padding: 24px 0;
          border-top: 1px solid var(--nl-border);
        }
        h2 {
          margin: 0 0 6px;
          font-size: 18px;
          font-weight: 700;
        }
        .hint {
          margin: 0 0 12px;
          font-size: 14px;
          line-height: 1.5;
          color: var(--nl-text-faint);
        }
        textarea,
        .field,
        .addRow input,
        .linkBox input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border: 1px solid var(--nl-border-strong);
          border-radius: 10px;
          background: var(--nl-bg-raised);
          color: var(--nl-text);
          font-size: 16px;
          font-family: inherit;
        }
        .field {
          min-height: 44px;
          margin-top: 10px;
        }
        .rows {
          list-style: none;
          margin: 0 0 10px;
          padding: 0;
        }
        .rows li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          margin-bottom: 6px;
          border: 1px solid var(--nl-border);
          border-radius: 10px;
          background: var(--nl-surface);
        }
        .rows li.bad {
          border-color: rgba(255, 120, 120, 0.4);
        }
        .rows span {
          color: var(--nl-text-dim);
          font-size: 14px;
        }
        .btns {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .count {
          min-height: 34px;
          padding: 0 10px;
          border: 1px solid var(--nl-border-strong);
          border-radius: 999px;
          background: transparent;
          color: var(--nl-text);
          font-size: 13px;
          cursor: pointer;
        }
        .count.good {
          border-color: var(--nl-aurora-a);
          color: var(--nl-aurora-a);
        }
        .x {
          border: none;
          background: none;
          color: var(--nl-text-faint);
          font-size: 18px;
          cursor: pointer;
        }
        .addRow {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 8px;
        }
        .addRow:has(input:only-of-type) {
          grid-template-columns: 1fr auto;
        }
        .btnRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .linkBox {
          margin-top: 12px;
          display: grid;
          gap: 10px;
        }
        .ficha :global(.danger) {
          border-color: rgba(255, 120, 120, 0.5);
          color: #ffb4b4;
        }
        @media (max-width: 640px) {
          .verbs {
            grid-template-columns: 1fr 1fr;
          }
          .addRow {
            grid-template-columns: 1fr;
          }
          .rows li {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </SiteLayout>
  );
}
