import Head from "next/head";
import Layout from "@/components/Layout";
import { useLang } from "@/lib/language";

const T = {
  es: {
    title: "Privacidad",
    intro:
      "En NeuroLjus, la privacidad es un principio de diseño, no una idea tardía. Trabajamos con personas en situación de vulnerabilidad y tratamos sus datos con el máximo cuidado.",
    points: [
      ["Minimización de datos", "Recopilamos solo lo estrictamente necesario para prestar el servicio."],
      ["Procesamiento local", "El análisis de la cámara ocurre en tu dispositivo siempre que es posible. Nada se envía sin tu consentimiento explícito."],
      ["Sin datos clínicos por email", "Te pedimos que no envíes información médica a través del formulario de contacto."],
      ["Cumplimiento GDPR", "Diseñamos conforme al RGPD. Publicaremos una política completa antes de pilotos públicos."],
    ],
    contact: "Para cualquier consulta sobre privacidad, escríbenos a elizabeth@neuroljus.com.",
    updated: "Última actualización",
  },
  en: {
    title: "Privacy",
    intro:
      "At NeuroLjus, privacy is a design principle, not an afterthought. We work with people in vulnerable situations and treat their data with the utmost care.",
    points: [
      ["Data minimization", "We collect only what is strictly necessary to deliver the service."],
      ["On-device processing", "Camera analysis happens on your device whenever possible. Nothing is sent without your explicit consent."],
      ["No clinical data by email", "Please do not send medical information through the contact form."],
      ["GDPR compliance", "We design in line with GDPR. A full policy will be published before public pilots."],
    ],
    contact: "For any privacy enquiry, email us at elizabeth@neuroljus.com.",
    updated: "Last updated",
  },
  sv: {
    title: "Integritet",
    intro:
      "Hos NeuroLjus är integritet en designprincip, inte en eftertanke. Vi arbetar med personer i utsatta situationer och behandlar deras data med största omsorg.",
    points: [
      ["Dataminimering", "Vi samlar bara in det som är strikt nödvändigt för tjänsten."],
      ["Lokal bearbetning", "Kameraanalys sker på din enhet när det är möjligt. Inget skickas utan ditt uttryckliga samtycke."],
      ["Inga kliniska data via e-post", "Skicka inte medicinsk information via kontaktformuläret."],
      ["GDPR-efterlevnad", "Vi utformar i linje med GDPR. En fullständig policy publiceras före offentliga piloter."],
    ],
    contact: "För frågor om integritet, mejla oss på elizabeth@neuroljus.com.",
    updated: "Senast uppdaterad",
  },
} as const;

export default function Privacy() {
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
        <p className="nl-footer-fine">
          {t.updated}: 2026-06-15
        </p>
      </div>
    </Layout>
  );
}
