import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "sv" | "en" | "es";

const LANG_KEY = "nl_lang";

/**
 * Shared language state: pages read and write the same localStorage key so
 * the chosen language follows the visitor across the whole site.
 */
export function useLang(defaultLang: Lang = "en"): [Lang, (next: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (stored === "sv" || stored === "en" || stored === "es") setLangState(stored);
    } catch {
      /* private mode */
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      /* private mode */
    }
  };

  return [lang, setLang];
}

const navLabels: Record<Lang, Record<string, string>> = {
  sv: {
    skip: "Hoppa till innehållet",
    home: "Hem",
    about: "Om",
    method: "Metod",
    contact: "Kontakt",
    labs: "Labb",
    menu: "Meny",
    footer: "Neuroljus omvandlar levd omsorgskunskap till strukturerad intelligens för framtida assisterande system.",
    rights: "Ett oberoende forskningsprojekt av Elizabeth Ospina.",
  },
  en: {
    skip: "Skip to content",
    home: "Home",
    about: "About",
    method: "Method",
    contact: "Contact",
    labs: "Labs",
    menu: "Menu",
    footer: "Neuroljus turns lived care into structured intelligence for future assistive systems.",
    rights: "An independent research project by Elizabeth Ospina.",
  },
  es: {
    skip: "Saltar al contenido",
    home: "Inicio",
    about: "Sobre",
    method: "Método",
    contact: "Contacto",
    labs: "Labs",
    menu: "Menú",
    footer: "Neuroljus convierte el cuidado vivido en inteligencia estructurada para futuros sistemas asistivos.",
    rights: "Un proyecto de investigación independiente de Elizabeth Ospina.",
  },
};

type NavItem = { href: string; label: string; match: (path: string) => boolean };

export default function SiteLayout({
  children,
  lang = "en",
  onLangChange,
}: {
  children: ReactNode;
  lang?: Lang;
  onLangChange?: (next: Lang) => void;
}) {
  const router = useRouter();
  const path = router.pathname;
  const t = navLabels[lang];

  const items: NavItem[] = [
    { href: "/", label: t.home, match: (p) => p === "/" },
    { href: "/labs/nl-vision", label: "NL-VISION", match: (p) => p === "/labs/nl-vision" },
    {
      href: "/labs/future-care-room",
      label: "Care Room",
      match: (p) => p === "/labs/future-care-room",
    },
    {
      href: "/labs/robot-interface",
      label: "Robot Lab",
      match: (p) => p === "/labs/robot-interface",
    },
    { href: "/observation-method", label: t.method, match: (p) => p === "/observation-method" },
    { href: "/about", label: t.about, match: (p) => p === "/about" },
    { href: "/contact", label: t.contact, match: (p) => p === "/contact" },
  ];

  return (
    <div className="layout">
      <a className="skipLink" href="#nl-content">
        {t.skip}
      </a>

      <header className="siteHeader" role="banner">
        <div className="headerInner nl-shell">
          <Link className="brand" href="/" aria-label={`NeuroLjus — ${t.home}`}>
            <Image
              src="/brand/neuroljus-logo.svg"
              alt=""
              width={34}
              height={34}
              priority
              className="brandLogo"
            />
            <span className="brandName">NeuroLjus</span>
          </Link>

          <nav className="nav" aria-label="Primary">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={item.match(path) ? "navLink active" : "navLink"}
                aria-current={item.match(path) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {onLangChange && (
            <div className="langToggle" role="group" aria-label="Language">
              {(["es", "en", "sv"] as Lang[]).map((code) => (
                <button
                  key={code}
                  onClick={() => onLangChange(code)}
                  aria-pressed={lang === code}
                  className={lang === code ? "langBtn active" : "langBtn"}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main id="nl-content" className="content">
        {children}
      </main>

      <footer className="siteFooter" role="contentinfo">
        <div className="footerInner nl-shell">
          <p className="footerLede">{t.footer}</p>
          <nav className="footerNav" aria-label="Footer">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="footerLink">
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="footerNote">{t.rights}</p>
        </div>
      </footer>

      <style jsx>{`
        .layout {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
        }
        .skipLink {
          position: absolute;
          left: -9999px;
          top: 0;
          z-index: 100;
          padding: 10px 16px;
          border-radius: 0 0 10px 0;
          background: var(--nl-aurora-grad);
          color: var(--nl-on-aurora);
          font-weight: 800;
          text-decoration: none;
        }
        .skipLink:focus {
          left: 0;
        }
        .siteHeader {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(6, 11, 22, 0.78);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--nl-border);
        }
        .headerInner {
          min-height: 64px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px 18px;
          padding: 8px 0;
        }
        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--nl-text);
          text-decoration: none;
        }
        .brand :global(.brandLogo) {
          filter: drop-shadow(0 6px 18px rgba(94, 230, 164, 0.35));
        }
        .brandName {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.01em;
        }
        .nav {
          margin-left: auto;
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }
        .nav :global(.navLink) {
          padding: 7px 11px;
          border-radius: 999px;
          color: var(--nl-text-dim);
          font-size: 13.5px;
          font-weight: 650;
          text-decoration: none;
          transition: color 140ms ease, background 140ms ease;
        }
        .nav :global(.navLink:hover) {
          color: var(--nl-text);
          background: var(--nl-surface-strong);
        }
        .nav :global(.navLink.active) {
          color: var(--nl-on-aurora);
          background: var(--nl-aurora-grad);
        }
        .langToggle {
          display: inline-flex;
          gap: 2px;
          padding: 3px;
          border: 1px solid var(--nl-border);
          border-radius: 999px;
          background: var(--nl-surface);
        }
        .langToggle :global(.langBtn) {
          min-width: 38px;
          padding: 5px 8px;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: var(--nl-text-dim);
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }
        .langToggle :global(.langBtn.active) {
          background: var(--nl-aurora-grad);
          color: var(--nl-on-aurora);
        }
        .content {
          flex: 1;
        }
        .siteFooter {
          margin-top: 56px;
          border-top: 1px solid var(--nl-border);
          background: rgba(6, 11, 22, 0.6);
        }
        .footerInner {
          padding: 30px 0 36px;
          display: grid;
          gap: 14px;
        }
        .footerLede {
          margin: 0;
          max-width: 560px;
          color: var(--nl-text-dim);
          font-size: 14px;
          line-height: 1.6;
        }
        .footerNav {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 14px;
        }
        .footerNav :global(.footerLink) {
          color: var(--nl-text-dim);
          font-size: 13px;
          font-weight: 650;
          text-decoration: none;
        }
        .footerNav :global(.footerLink:hover) {
          color: var(--nl-aurora-b);
        }
        .footerNote {
          margin: 0;
          color: var(--nl-text-faint);
          font-size: 12.5px;
        }
        @media (max-width: 760px) {
          .nav {
            order: 3;
            width: 100%;
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
