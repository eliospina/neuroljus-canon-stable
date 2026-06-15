import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { useLang, type Lang } from "@/lib/language";

const NAV = {
  es: { demo: "Demo", about: "Sobre nosotras", contact: "Contacto", skip: "Saltar al contenido" },
  en: { demo: "Demo", about: "About", contact: "Contact", skip: "Skip to content" },
  sv: { demo: "Demo", about: "Om oss", contact: "Kontakt", skip: "Hoppa till innehåll" },
} as const;

const FOOTER = {
  es: {
    tagline: "IA empática al servicio de la dignidad humana.",
    nav: "Navegación",
    legal: "Legal",
    privacy: "Privacidad",
    accessibility: "Accesibilidad",
    contact: "Contacto",
    fine: "NeuroLjus es un proyecto experimental. Los datos permanecen en tu dispositivo salvo que des tu consentimiento explícito. No sustituye consejo médico profesional.",
  },
  en: {
    tagline: "Empathic AI in service of human dignity.",
    nav: "Navigation",
    legal: "Legal",
    privacy: "Privacy",
    accessibility: "Accessibility",
    contact: "Contact",
    fine: "NeuroLjus is an experimental project. Data stays on your device unless you explicitly consent otherwise. It is not a substitute for professional medical advice.",
  },
  sv: {
    tagline: "Empatisk AI i tjänst av mänsklig värdighet.",
    nav: "Navigering",
    legal: "Juridik",
    privacy: "Integritet",
    accessibility: "Tillgänglighet",
    contact: "Kontakt",
    fine: "NeuroLjus är ett experimentellt projekt. Data stannar på din enhet om du inte uttryckligen samtycker till annat. Det ersätter inte professionell medicinsk rådgivning.",
  },
} as const;

const LANGS: Lang[] = ["es", "en", "sv"];

export default function Layout({ children }: { children: ReactNode }) {
  const { lang, setLang } = useLang();
  const nav = NAV[lang];
  const foot = FOOTER[lang];
  const year = new Date().getFullYear();

  return (
    <div className="nl-shell">
      <a className="nl-skip" href="#main">
        {nav.skip}
      </a>

      <header className="nl-header">
        <div className="nl-container nl-header-inner">
          <Link className="nl-brand" href="/" aria-label="NeuroLjus">
            <span className="nl-brand-badge">
              <Image
                src="/brand/neuroljus-logo.svg"
                alt=""
                width={28}
                height={28}
                priority
              />
            </span>
            <span>
              <span className="nl-brand-name">NeuroLjus</span>
              <span className="nl-brand-tag" style={{ display: "block" }}>
                {foot.tagline}
              </span>
            </span>
          </Link>

          <nav className="nl-nav" aria-label={nav.skip}>
            <Link href="/labs/nl-vision" className="nl-nav-keep">
              {nav.demo}
            </Link>
            <Link href="/about">{nav.about}</Link>
            <Link href="/contact">{nav.contact}</Link>
          </nav>

          <div className="nl-langtoggle" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                aria-label={l === "es" ? "Español" : l === "en" ? "English" : "Svenska"}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="main" className="nl-main">
        <div className="nl-container">{children}</div>
      </main>

      <footer className="nl-footer">
        <div className="nl-container nl-footer-inner">
          <div style={{ maxWidth: 320 }}>
            <div className="nl-brand" style={{ marginBottom: 8 }}>
              <span className="nl-brand-badge">
                <Image src="/brand/neuroljus-logo.svg" alt="" width={24} height={24} />
              </span>
              <span className="nl-brand-name">NeuroLjus</span>
            </div>
            <p className="nl-footer-fine">{foot.tagline}</p>
          </div>

          <nav className="nl-footer-links" aria-label={foot.nav}>
            <Link href="/about">{NAV[lang].about}</Link>
            <Link href="/labs/nl-vision">{NAV[lang].demo}</Link>
            <Link href="/contact">{foot.contact}</Link>
            <Link href="/privacy">{foot.privacy}</Link>
            <Link href="/accessibility">{foot.accessibility}</Link>
          </nav>
        </div>
        <div className="nl-container" style={{ marginTop: 20 }}>
          <p className="nl-footer-fine">{foot.fine}</p>
          <p className="nl-footer-fine" style={{ marginTop: 8 }}>
            © {year} NeuroLjus · neuroljus.com
          </p>
        </div>
      </footer>
    </div>
  );
}
