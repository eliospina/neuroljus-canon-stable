import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import SiteLayout, { useLang } from "@/components/SiteLayout";
import { FICHA_COPY } from "@/lib/ficha/copy";
import { decodeCard, type Card } from "@/lib/ficha/model";

/**
 * The 30-second card, read-only, for whoever receives the link. The card
 * travels inside the URL fragment: nothing is fetched or stored. The browser
 * never sends the fragment to the server.
 */

export default function TarjetaPage() {
  const [lang, setLang] = useLang("es");
  const [card, setCard] = useState<Card | null | undefined>(undefined);

  useEffect(() => {
    const code = window.location.hash.replace(/^#/, "");
    const decoded = code ? decodeCard(code) : null;
    setCard(decoded);
    if (decoded) setLang(decoded.lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = FICHA_COPY[lang];
  const c = copy.cardPage;

  return (
    <SiteLayout lang={lang} onLangChange={setLang}>
      <Head>
        <title>{card ? `${card.name} · ${c.title}` : copy.seoTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className="card">
        {card === undefined ? null : card === null ? (
          <>
            <p className="kicker">{copy.kicker}</p>
            <h1>{c.empty}</h1>
            <Link href="/ficha" className="nl-cta">
              {c.makeOwn}
            </Link>
          </>
        ) : (
          <>
            <p className="kicker">{copy.kicker}</p>
            <h1>
              {card.name} <span>{c.title}</span>
            </h1>
            <p className="sub">
              {copy.ages[card.age]}, {copy.speechLine[card.speech]}. {c.sub}
            </p>

            {card.words && (
              <section className="words">
                <h2>{c.words}</h2>
                <blockquote>{card.words}</blockquote>
              </section>
            )}

            <div className="grid">
              <section>
                <h2>{c.do}</h2>
                <ul>{card.do.length ? card.do.map((d) => <li key={d}>{d}</li>) : <li className="none">{c.none}</li>}</ul>
              </section>
              <section className="dont">
                <h2>{c.dont}</h2>
                <ul>{card.dont.length ? card.dont.map((d) => <li key={d}>{d}</li>) : <li className="none">{c.none}</li>}</ul>
              </section>
            </div>

            {card.signals.length > 0 && (
              <section>
                <h2>{c.signals}</h2>
                <ul className="signals">
                  {card.signals.map((s) => (
                    <li key={s.sign}>
                      <strong>{s.sign}</strong>
                      {s.meaning && <span> → {s.meaning}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="crisis">
              <h2>{c.steps}</h2>
              <ol>{card.steps.length ? card.steps.map((s) => <li key={s}>{s}</li>) : <li className="none">{c.none}</li>}</ol>
              {card.whomToCall && (
                <p>
                  <strong>{c.whom}:</strong> {card.whomToCall}
                </p>
              )}
              {card.medication && (
                <p>
                  <strong>{c.medication}:</strong> {card.medication}
                </p>
              )}
              {card.clinician && (
                <p>
                  <strong>{c.clinician}:</strong> {card.clinician}
                </p>
              )}
            </section>
          </>
        )}
      </main>

      <style jsx>{`
        .card {
          max-width: 720px;
          margin: 0 auto;
          padding: 56px 20px 120px;
        }
        .kicker {
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--nl-aurora-a);
          margin: 0 0 12px;
        }
        h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 44px);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        h1 span {
          color: var(--nl-text-dim);
          font-weight: 500;
        }
        .sub {
          margin: 10px 0 24px;
          color: var(--nl-text-dim);
          font-size: 16px;
        }
        h2 {
          margin: 0 0 10px;
          font-size: 14px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--nl-text-faint);
        }
        section {
          margin-top: 24px;
        }
        .words blockquote {
          margin: 0;
          padding: 16px 18px;
          border-left: 3px solid var(--nl-aurora-a);
          background: var(--nl-surface);
          font-size: 19px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        ul,
        ol {
          margin: 0;
          padding-left: 20px;
          font-size: 18px;
          line-height: 1.5;
        }
        li + li {
          margin-top: 6px;
        }
        .dont ul {
          color: #ffb4b4;
        }
        .signals {
          list-style: none;
          padding: 0;
        }
        .signals span {
          color: var(--nl-text-dim);
        }
        .crisis {
          padding: 18px;
          border: 1px solid var(--nl-border-strong);
          border-radius: var(--nl-radius);
          background: var(--nl-surface);
        }
        .crisis ol {
          font-size: 19px;
          font-weight: 600;
        }
        .crisis p {
          margin: 12px 0 0;
          font-size: 16px;
        }
        .none {
          color: var(--nl-text-faint);
          list-style: none;
          margin-left: -20px;
        }
        @media (max-width: 560px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </SiteLayout>
  );
}
