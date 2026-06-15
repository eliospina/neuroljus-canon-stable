import Head from "next/head";
import Layout from "@/components/Layout";
import { useLang } from "@/lib/language";

const T = {
  es: {
    title: "Accesibilidad",
    intro:
      "La accesibilidad es central en NeuroLjus. Diseñamos para experiencias calmadas y de baja estimulación, pensando en personas con sensibilidades sensoriales.",
    points: [
      ["Baja estimulación", "Paleta suave, alto contraste de lectura y ausencia de elementos parpadeantes o intermitentes."],
      ["Movimiento reducido", "Respetamos la preferencia del sistema «reducir movimiento» y minimizamos animaciones."],
      ["Navegación por teclado", "Indicadores de foco visibles y un enlace para saltar al contenido."],
      ["Objetivo WCAG 2.2 AA", "Iteramos con la retroalimentación de las personas usuarias para cumplir el estándar."],
    ],
    contact: "¿Encontraste una barrera de accesibilidad? Cuéntanos: elizabeth@neuroljus.com.",
  },
  en: {
    title: "Accessibility",
    intro:
      "Accessibility is central to NeuroLjus. We design for calm, low-stimulus experiences, with sensory sensitivities in mind.",
    points: [
      ["Low stimulation", "Soft palette, high reading contrast, and no flashing or blinking elements."],
      ["Reduced motion", "We honor the system 'reduce motion' preference and minimize animations."],
      ["Keyboard navigation", "Visible focus indicators and a skip-to-content link."],
      ["WCAG 2.2 AA goal", "We iterate with user feedback to meet the standard."],
    ],
    contact: "Found an accessibility barrier? Tell us: elizabeth@neuroljus.com.",
  },
  sv: {
    title: "Tillgänglighet",
    intro:
      "Tillgänglighet är centralt för NeuroLjus. Vi utformar lugna, lågstimulerande upplevelser med sensoriska känsligheter i åtanke.",
    points: [
      ["Låg stimulering", "Mjuk palett, hög läskontrast och inga blinkande element."],
      ["Reducerad rörelse", "Vi respekterar systeminställningen 'reducera rörelse' och minimerar animationer."],
      ["Tangentbordsnavigering", "Synliga fokusindikatorer och en länk för att hoppa till innehållet."],
      ["Mål: WCAG 2.2 AA", "Vi itererar med användarnas återkoppling för att nå standarden."],
    ],
    contact: "Hittade du ett tillgänglighetshinder? Berätta: elizabeth@neuroljus.com.",
  },
} as const;

export default function Accessibility() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <Layout>
      <Head>
        <title>{t.title} — NeuroLjus</title>
      </Head>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 className="nl-title" style={{ fontSize: 34 }}>
          {t.title}
        </h1>
        <p className="nl-sub">{t.intro}</p>
        <div style={{ display: "grid", gap: 16 }}>
          {t.points.map(([h, p]) => (
            <article className="nl-card" key={h}>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <p className="nl-footer-fine" style={{ marginTop: 24 }}>
          {t.contact}
        </p>
      </div>
    </Layout>
  );
}
