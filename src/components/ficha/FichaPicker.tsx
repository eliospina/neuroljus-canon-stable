import Link from "next/link";
import { useEffect, useState } from "react";
import type { Ficha, FichaLang } from "@/lib/ficha/model";
import { readActiveId, readFichas, writeActiveId } from "@/lib/ficha/localStore";

/**
 * "For: Mateo". Picks the person a tool is working for, so what happens here
 * is written into their ficha. Reads ?ficha=<id> once, then remembers the
 * choice in this browser. Shows nothing when there are no fichas yet, except
 * a quiet link to create one.
 */

const T: Record<FichaLang, { for: string; nobody: string; note: string; create: string }> = {
  es: { for: "Para", nobody: "Nadie en concreto", note: "Lo que pase aquí se anota en su ficha.", create: "Crear una ficha para que esto se recuerde" },
  en: { for: "For", nobody: "No one in particular", note: "What happens here is written into their profile.", create: "Create a profile so this is remembered" },
  sv: { for: "För", nobody: "Ingen särskild", note: "Det som händer här skrivs in i profilen.", create: "Skapa en profil så att detta kommer ihåg" },
};

export function useActiveFicha(): [string | null, (id: string | null) => void, Ficha[]] {
  const [list, setList] = useState<Ficha[]>([]);
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const all = readFichas();
    setList(all);
    const fromUrl = new URLSearchParams(window.location.search).get("ficha");
    if (fromUrl && all.some((f) => f.id === fromUrl)) {
      writeActiveId(fromUrl);
      setActive(fromUrl);
    } else {
      setActive(readActiveId());
    }
  }, []);
  const choose = (id: string | null) => {
    writeActiveId(id);
    setActive(id);
  };
  return [active, choose, list];
}

export default function FichaPicker({ lang, active, onChange, list }: { lang: FichaLang; active: string | null; onChange: (id: string | null) => void; list: Ficha[] }) {
  const t = T[lang];
  if (list.length === 0)
    return (
      <p className="picker empty">
        <Link href="/ficha">{t.create} →</Link>
        <style jsx>{`
          .picker {
            margin: 0 0 16px;
            font-size: 14px;
          }
          .picker :global(a) {
            color: var(--nl-text-dim, #a1a1aa);
          }
        `}</style>
      </p>
    );
  return (
    <div className="picker">
      <label>
        <span>{t.for}</span>
        <select value={active ?? ""} onChange={(e) => onChange(e.target.value || null)}>
          <option value="">{t.nobody}</option>
          {list.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      {active && <small>{t.note}</small>}
      <style jsx>{`
        .picker {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px 14px;
          margin: 0 0 16px;
        }
        label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
        }
        select {
          min-height: 40px;
          padding: 0 10px;
          border: 1px solid rgba(148, 184, 224, 0.28);
          border-radius: 10px;
          background: #0b1424;
          color: inherit;
          font-size: 16px;
        }
        small {
          color: var(--nl-text-faint, #8a8a93);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
