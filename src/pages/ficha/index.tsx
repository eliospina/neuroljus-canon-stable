import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SiteLayout, { useLang } from "@/components/SiteLayout";
import { FICHA_COPY } from "@/lib/ficha/copy";
import { emptyFicha, type AgeBand, type Ficha, type Owner, type Speech } from "@/lib/ficha/model";
import { readFichas, saveFicha } from "@/lib/ficha/localStore";

/**
 * The list of profiles in this browser and the five questions that create one.
 * Design: docs/strategy/ficha-de-la-persona.md, section 2.
 */

function ListInput({ items, onChange, placeholder, add, remove, max = 3 }: { items: string[]; onChange: (next: string[]) => void; placeholder: string; add: string; remove: string; max?: number }) {
  const [draft, setDraft] = useState("");
  const push = () => {
    const v = draft.trim();
    if (!v || items.length >= max) return;
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <div className="listInput">
      <ul>
        {items.map((it, i) => (
          <li key={`${it}-${i}`}>
            <span>{it}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={remove}>
              ×
            </button>
          </li>
        ))}
      </ul>
      {items.length < max && (
        <div className="row">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), push())} />
          <button type="button" className="nl-cta-ghost" onClick={push}>
            {add}
          </button>
        </div>
      )}
      <style jsx>{`
        ul {
          list-style: none;
          margin: 0 0 8px;
          padding: 0;
        }
        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 12px;
          margin-bottom: 6px;
          border: 1px solid var(--nl-border);
          border-radius: 10px;
          background: var(--nl-surface);
        }
        li button {
          border: none;
          background: none;
          color: var(--nl-text-faint);
          font-size: 18px;
          cursor: pointer;
        }
        .row {
          display: flex;
          gap: 8px;
        }
        input {
          flex: 1;
          min-width: 0;
        }
      `}</style>
    </div>
  );
}

export default function FichaIndex() {
  const [lang, setLang] = useLang("es");
  const copy = FICHA_COPY[lang];
  const router = useRouter();
  const [list, setList] = useState<Ficha[]>([]);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Ficha>(() => emptyFicha("es"));

  useEffect(() => {
    setList(readFichas());
  }, []);

  const start = () => {
    setDraft(emptyFicha(lang));
    setCreating(true);
  };

  const create = () => {
    if (!draft.name.trim()) return;
    const saved = saveFicha({ ...draft, lang });
    router.push(`/ficha/${saved.id}`);
  };

  return (
    <SiteLayout lang={lang} onLangChange={setLang}>
      <Head>
        <title>{copy.seoTitle}</title>
        <meta name="description" content={copy.listSub} />
        <meta name="robots" content="noindex" />
      </Head>
      <main className="ficha">
        <p className="kicker">{copy.kicker}</p>
        <h1>{copy.listTitle}</h1>
        <p className="sub">{copy.listSub}</p>

        {!creating && (
          <>
            <button type="button" className="nl-cta big" onClick={start}>
              {copy.create}
            </button>
            <section className="list" aria-label={copy.kicker}>
              {list.length === 0 ? (
                <p className="none">{copy.none}</p>
              ) : (
                list.map((f) => (
                  <Link key={f.id} href={`/ficha/${f.id}`} className="item">
                    <strong>{f.name}</strong>
                    <span>{copy.ages[f.age]}, {copy.speechLine[f.speech]}</span>
                    <em>{copy.open} →</em>
                  </Link>
                ))
              )}
            </section>
          </>
        )}

        {creating && (
          <form
            className="create"
            onSubmit={(e) => {
              e.preventDefault();
              create();
            }}
          >
            <label>
              <span>{copy.q.name}</span>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder={copy.placeholder.name} maxLength={60} autoFocus />
            </label>
            <fieldset>
              <legend>{copy.q.age}</legend>
              {(["child", "teen", "adult"] as AgeBand[]).map((a) => (
                <label key={a} className="choice">
                  <input type="radio" name="age" checked={draft.age === a} onChange={() => setDraft({ ...draft, age: a })} />
                  {copy.ages[a]}
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>{copy.q.speech}</legend>
              {(["yes", "some", "no"] as Speech[]).map((s) => (
                <label key={s} className="choice">
                  <input type="radio" name="speech" checked={draft.speech === s} onChange={() => setDraft({ ...draft, speech: s })} />
                  {copy.speeches[s]}
                </label>
              ))}
            </fieldset>
            <div className="q">
              <span>{copy.q.calms}</span>
              <ListInput items={draft.calms} onChange={(calms) => setDraft({ ...draft, calms })} placeholder={copy.placeholder.list} add={copy.add} remove={copy.remove} />
            </div>
            <div className="q">
              <span>{copy.q.triggers}</span>
              <ListInput items={draft.triggers} onChange={(triggers) => setDraft({ ...draft, triggers })} placeholder={copy.placeholder.list} add={copy.add} remove={copy.remove} />
            </div>
            <fieldset>
              <legend>{copy.q.owner}</legend>
              {(["carer", "person"] as Owner[]).map((o) => (
                <label key={o} className="choice">
                  <input type="radio" name="owner" checked={draft.owner === o} onChange={() => setDraft({ ...draft, owner: o })} />
                  {copy.owners[o]}
                </label>
              ))}
            </fieldset>
            <div className="actions">
              <button type="submit" className="nl-cta" disabled={!draft.name.trim()}>
                {copy.save}
              </button>
              <button type="button" className="nl-cta-ghost" onClick={() => setCreating(false)}>
                {copy.cancel}
              </button>
            </div>
            <p className="stored">{copy.storedHere}</p>
          </form>
        )}
      </main>

      <style jsx>{`
        .ficha {
          max-width: 720px;
          margin: 0 auto;
          padding: 64px 20px 120px;
        }
        .kicker {
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--nl-aurora-a);
          margin: 0 0 14px;
        }
        h1 {
          margin: 0;
          font-size: clamp(28px, 4.5vw, 40px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .sub {
          margin: 14px 0 28px;
          font-size: 16px;
          line-height: 1.55;
          color: var(--nl-text-dim);
        }
        .big {
          min-height: 56px;
          font-size: 18px;
        }
        .list {
          margin-top: 32px;
          display: grid;
          gap: 10px;
        }
        .none {
          color: var(--nl-text-faint);
        }
        .ficha :global(.item) {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2px 12px;
          padding: 16px 18px;
          border: 1px solid var(--nl-border);
          border-radius: var(--nl-radius);
          background: var(--nl-surface);
          color: var(--nl-text);
          text-decoration: none;
        }
        .ficha :global(.item strong) {
          font-size: 18px;
        }
        .ficha :global(.item span) {
          grid-column: 1;
          color: var(--nl-text-dim);
          font-size: 14px;
        }
        .ficha :global(.item em) {
          grid-column: 2;
          grid-row: 1 / span 2;
          align-self: center;
          font-style: normal;
          color: var(--nl-aurora-a);
          font-weight: 700;
        }
        .create {
          display: grid;
          gap: 22px;
          margin-top: 8px;
        }
        label,
        .q > span,
        legend {
          display: block;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .ficha :global(input[type="text"]),
        .ficha :global(input:not([type])) {
          width: 100%;
          min-height: 44px;
          padding: 0 12px;
          border: 1px solid var(--nl-border-strong);
          border-radius: 10px;
          background: var(--nl-bg-raised);
          color: var(--nl-text);
          font-size: 16px;
        }
        fieldset {
          border: none;
          margin: 0;
          padding: 0;
        }
        .choice {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 18px 0 0;
          font-weight: 500;
        }
        .actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .stored {
          font-size: 13px;
          color: var(--nl-text-faint);
          line-height: 1.5;
        }
      `}</style>
    </SiteLayout>
  );
}
