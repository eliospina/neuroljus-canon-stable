import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useLang } from "@/lib/language";

const T = {
  es: {
    title: "¡Gracias!",
    text: "Recibimos tu mensaje y te responderemos en 1–2 días hábiles.",
    back: "Volver al inicio",
  },
  en: {
    title: "Thanks!",
    text: "We received your message and will reply within 1–2 business days.",
    back: "Back to home",
  },
  sv: {
    title: "Tack!",
    text: "Vi har tagit emot ditt meddelande och svarar inom 1–2 arbetsdagar.",
    back: "Tillbaka till start",
  },
} as const;

export default function Thanks() {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <Layout>
      <Head>
        <title>{t.title} — NeuroLjus</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="nl-center" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 className="nl-title">{t.title}</h1>
        <p className="nl-sub" style={{ marginLeft: "auto", marginRight: "auto" }}>
          {t.text}
        </p>
        <Link className="nl-btn nl-btn-primary" href="/">
          {t.back}
        </Link>
      </div>
    </Layout>
  );
}
