import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import { createElement, useState } from "react";
import SiteLayout, { useLang, type Lang } from "@/components/SiteLayout";

/**
 * The Line: the voice support line, part of Neuroljus. The voice runs on
 * ElevenLabs (this page embeds its widget); the reasoning runs on
 * neuroljus.com (src/lib/line). No phone number yet: the button on this page
 * is the way in. See docs/line/README.md.
 */

const AGENT_ID = "agent_8701m5aah553evdr2vkbaqp4rctq";
const WIDGET_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

type Copy = {
  seoTitle: string;
  seoDesc: string;
  kicker: string;
  title: string;
  lead: string;
  emergency: string;
  start: string;
  starting: string;
  how: string;
  howSteps: string[];
  whatTitle: string;
  what: string[];
  whoTitle: string;
  who: string;
  privacyTitle: string;
  privacy: string[];
  partTitle: string;
  part: string;
  companion: string;
  ask: string;
  back: string;
  readMore: string;
  readLess: string;
};

const T: Record<Lang, Copy> = {
  es: {
    seoTitle: "La Línea — Neuroljus",
    seoDesc: "Línea de apoyo en crisis para personas autistas y quienes las cuidan. Responde las 24 horas, en español, inglés y sueco.",
    kicker: "La Línea · parte de Neuroljus",
    title: "Alguien que sabe qué hacer, ahora.",
    lead: "Una línea de apoyo para momentos de crisis con una persona autista: una rabieta que no baja, alguien que se golpea, que se escapó, que no come, que no duerme. Responde al instante, con pasos concretos, las 24 horas, en español, inglés y sueco.",
    emergency: "Si hay peligro de vida ahora mismo, llama primero al número de emergencias de tu país.",
    start: "Hablar ahora",
    starting: "Abriendo la línea…",
    how: "Cómo funciona",
    howSteps: ["Pulsa el botón y permite el micrófono. No hace falta registrarse ni descargar nada.", "Di lo que está pasando, con tus palabras. Dónde estás, qué hace la persona, qué has probado.", "Recibes uno o dos pasos concretos, y la línea escucha. Vuelve a hablar cuando quieras.", "Si hace falta, te da el número de emergencias de tu país. Tú decides."],
    whatTitle: "Qué puedes esperar",
    what: ["Pasos concretos para los próximos minutos, no teoría.", "Nada de sermones ni juicios. La seguridad de la persona va por delante de cualquier regla.", "Si preguntas por un medicamento o un síntoma, responde con lo que sabe y te dice lo que no sabe.", "Puede responderte la propia persona autista: frases cortas y ofertas, nunca órdenes."],
    whoTitle: "Quién responde",
    who: "Una inteligencia artificial que razona sobre tu situación con los diez protocolos de crisis de Neuroljus, escritos con cuidadores, y una biblioteca de investigación sobre autismo verificada. No es un médico ni un servicio de emergencias. Está en fase de prueba: cada llamada nos ayuda a mejorarla.",
    privacyTitle: "Privacidad",
    privacy: ["Neuroljus no guarda tu conversación ni pide tu nombre. Solo registramos etiquetas anónimas de qué tipo de ayuda hizo falta, para ampliar lo que la línea sabe.", "La voz la procesa ElevenLabs; su configuración conserva la transcripción unos días para soporte técnico y luego la borra. No se graba el audio."],
    partTitle: "Parte del mismo proyecto",
    part: "La Línea nace de lo mismo que todo Neuroljus: convertir el cuidado vivido en conocimiento estructurado. Los protocolos que usa son los que puedes leer y ejecutar en Companion, y la biblioteca es la que responde en Pregunta.",
    companion: "Abrir Companion",
    ask: "Preguntar a NeuroLjus",
    back: "Volver al inicio",
    readMore: "¿Cómo funciona y quién responde? Leer más",
    readLess: "Leer menos",
  },
  en: {
    seoTitle: "The Line — Neuroljus",
    seoDesc: "Crisis support line for autistic people and the people who care for them. Answers around the clock, in Spanish, English and Swedish.",
    kicker: "The Line · part of Neuroljus",
    title: "Someone who knows what to do, right now.",
    lead: "A support line for crisis moments with an autistic person: a meltdown that will not ease, someone hitting themself, someone who ran off, who will not eat, who will not sleep. It answers at once, with concrete steps, around the clock, in Spanish, English and Swedish.",
    emergency: "If a life is in danger right now, call your country's emergency number first.",
    start: "Talk now",
    starting: "Opening the line…",
    how: "How it works",
    howSteps: ["Press the button and allow the microphone. No signup, nothing to install.", "Say what is happening, in your own words. Where you are, what the person is doing, what you have tried.", "You get one or two concrete steps, and the line listens. Speak again whenever you want.", "If it is needed, it gives you your country's emergency number. You decide."],
    whatTitle: "What to expect",
    what: ["Concrete steps for the next few minutes, not theory.", "No lectures, no judgement. The person's safety comes before any rule.", "If you ask about a medication or a symptom, it answers with what it knows and tells you what it does not.", "The autistic person can call too: short sentences and offers, never orders."],
    whoTitle: "Who answers",
    who: "An artificial intelligence that reasons about your situation with Neuroljus's ten crisis protocols, written with caregivers, and a verified autism research library. It is not a doctor and not an emergency service. It is in a trial phase: every call helps us improve it.",
    privacyTitle: "Privacy",
    privacy: ["Neuroljus does not keep your conversation and does not ask your name. We only record anonymous tags of what kind of help was needed, to grow what the line knows.", "The voice is processed by ElevenLabs; its settings keep the transcript for a few days for technical support and then delete it. Audio is not recorded."],
    partTitle: "Part of the same project",
    part: "The Line grows from the same root as all of Neuroljus: turning lived care into structured knowledge. The protocols it uses are the ones you can read and run in Companion, and the library is the one that answers in Ask.",
    companion: "Open Companion",
    ask: "Ask NeuroLjus",
    back: "Back to home",
    readMore: "How it works and who answers? Read more",
    readLess: "Read less",
  },
  sv: {
    seoTitle: "Linjen — Neuroljus",
    seoDesc: "Stödlinje i kris för autistiska personer och de som tar hand om dem. Svarar dygnet runt, på svenska, engelska och spanska.",
    kicker: "Linjen · en del av Neuroljus",
    title: "Någon som vet vad man ska göra, just nu.",
    lead: "En stödlinje för krisögonblick med en autistisk person: ett utbrott som inte lägger sig, någon som slår sig själv, som sprungit iväg, som inte äter, som inte sover. Den svarar direkt, med konkreta steg, dygnet runt, på svenska, engelska och spanska.",
    emergency: "Om ett liv är i fara just nu, ring först ditt lands nödnummer.",
    start: "Prata nu",
    starting: "Öppnar linjen…",
    how: "Så fungerar det",
    howSteps: ["Tryck på knappen och tillåt mikrofonen. Ingen registrering, inget att installera.", "Berätta vad som händer, med dina egna ord. Var du är, vad personen gör, vad du har provat.", "Du får ett eller två konkreta steg, och linjen lyssnar. Prata igen när du vill.", "Om det behövs ger den dig ditt lands nödnummer. Du bestämmer."],
    whatTitle: "Vad du kan vänta dig",
    what: ["Konkreta steg för de närmaste minuterna, inte teori.", "Inga pekpinnar, inga omdömen. Personens säkerhet går före varje regel.", "Frågar du om ett läkemedel eller ett symtom svarar den med vad den vet och säger vad den inte vet.", "Den autistiska personen kan också ringa: korta meningar och erbjudanden, aldrig order."],
    whoTitle: "Vem som svarar",
    who: "En artificiell intelligens som resonerar om din situation utifrån Neuroljus tio krisprotokoll, skrivna med vårdgivare, och ett granskat forskningsbibliotek om autism. Den är inte en läkare och inte en larmcentral. Den är i testfas: varje samtal hjälper oss att göra den bättre.",
    privacyTitle: "Integritet",
    privacy: ["Neuroljus sparar inte ditt samtal och frågar inte efter ditt namn. Vi registrerar bara anonyma etiketter om vilken slags hjälp som behövdes, för att utöka det linjen kan.", "Rösten hanteras av ElevenLabs; deras inställningar behåller utskriften några dagar för teknisk support och raderar den sedan. Ljudet spelas inte in."],
    partTitle: "En del av samma projekt",
    part: "Linjen växer ur samma rot som hela Neuroljus: att göra levd omsorg till strukturerad kunskap. Protokollen den använder är de du kan läsa och köra i Companion, och biblioteket är det som svarar i Fråga.",
    companion: "Öppna Companion",
    ask: "Fråga NeuroLjus",
    back: "Tillbaka till start",
    readMore: "Hur fungerar det och vem svarar? Läs mer",
    readLess: "Läs mindre",
  },
};

export default function LinePage() {
  const [lang, setLang] = useLang("es");
  const copy = T[lang];
  const [opened, setOpened] = useState(false);
  const [more, setMore] = useState(false);

  // The ElevenLabs widget mounts itself bottom-right; our big button only brings it in and opens it.
  const openLine = () => {
    setOpened(true);
    const el = document.querySelector("elevenlabs-convai") as (HTMLElement & { shadowRoot: ShadowRoot | null }) | null;
    const btn = el?.shadowRoot?.querySelector("button") as HTMLButtonElement | null | undefined;
    btn?.click();
    el?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  return (
    <SiteLayout lang={lang} onLangChange={setLang}>
      <Head>
        <title>{copy.seoTitle}</title>
        <meta name="description" content={copy.seoDesc} />
      </Head>
      <Script src={WIDGET_SRC} strategy="afterInteractive" />
      {createElement("elevenlabs-convai", { "agent-id": AGENT_ID, "override-language": lang })}

      <main className="line">
        <section className="hero">
          <p className="kicker">{copy.kicker}</p>
          <h1>{copy.title}</h1>
          <p className="emergency">{copy.emergency}</p>
          <button type="button" className="start" onClick={openLine} aria-live="polite">
            {opened ? copy.starting : copy.start}
          </button>
          <button type="button" className="more" onClick={() => setMore((m) => !m)} aria-expanded={more} aria-controls="line-more">
            {more ? copy.readLess : copy.readMore}
          </button>
        </section>

        <div id="line-more" className="moreBody" hidden={!more}>
        <p className="lead">{copy.lead}</p>
        <section className="grid">
          <div>
            <h2>{copy.how}</h2>
            <ol>
              {copy.howSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <div>
            <h2>{copy.whatTitle}</h2>
            <ul>
              {copy.what.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid">
          <div>
            <h2>{copy.whoTitle}</h2>
            <p>{copy.who}</p>
          </div>
          <div>
            <h2>{copy.privacyTitle}</h2>
            {copy.privacy.map((s) => (
              <p key={s}>{s}</p>
            ))}
          </div>
        </section>

        <section className="part">
          <h2>{copy.partTitle}</h2>
          <p>{copy.part}</p>
          <div className="links">
            <Link href="/companion" className="nl-cta-ghost">
              {copy.companion}
            </Link>
            <Link href="/ask" className="nl-cta-ghost">
              {copy.ask}
            </Link>
            <Link href="/" className="nl-cta-ghost">
              {copy.back}
            </Link>
          </div>
        </section>
        </div>
      </main>

      <style jsx>{`
        .line {
          max-width: 880px;
          margin: 0 auto;
          padding: 72px 20px 120px;
        }
        .hero {
          padding-bottom: 24px;
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
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.08;
        }
        .lead {
          margin-top: 16px;
          max-width: 640px;
          font-size: 17px;
          line-height: 1.6;
          color: var(--nl-text-dim);
        }
        .emergency {
          margin-top: 16px;
          padding: 12px 14px;
          border-left: 3px solid var(--nl-aurora-a);
          background: var(--nl-surface);
          font-weight: 600;
          line-height: 1.5;
        }
        .start {
          margin-top: 24px;
          min-height: 64px;
          padding: 0 36px;
          border: none;
          border-radius: 16px;
          background: var(--nl-aurora-grad);
          color: #06110c;
          font-size: 22px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 14px 40px rgba(94, 230, 164, 0.3);
        }
        .start:hover {
          transform: translateY(-1px);
        }
        .more {
          display: block;
          margin-top: 22px;
          padding: 0;
          border: none;
          background: none;
          color: var(--nl-text-dim);
          font-size: 14px;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
        }
        .more:hover {
          color: var(--nl-aurora-a);
        }
        .moreBody {
          margin-top: 8px;
        }
        .moreBody[hidden] {
          display: none;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          padding: 28px 0;
          border-top: 1px solid var(--nl-border);
        }
        h2 {
          margin: 0 0 12px;
          font-size: 18px;
          font-weight: 700;
        }
        ol,
        ul {
          margin: 0;
          padding-left: 20px;
          line-height: 1.6;
          color: var(--nl-text-dim);
        }
        li + li {
          margin-top: 8px;
        }
        p {
          line-height: 1.6;
          color: var(--nl-text-dim);
        }
        .part {
          padding-top: 28px;
          border-top: 1px solid var(--nl-border);
        }
        .links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 16px;
        }
        @media (max-width: 720px) {
          .grid {
            grid-template-columns: 1fr;
          }
          .start {
            width: 100%;
          }
        }
      `}</style>
    </SiteLayout>
  );
}
