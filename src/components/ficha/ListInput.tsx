import { useState } from "react";

/** A short list of free-text items with add and remove. Enter adds. */
export default function ListInput({ items, onChange, placeholder, add, remove, max = 3 }: { items: string[]; onChange: (next: string[]) => void; placeholder: string; add: string; remove: string; max?: number }) {
  const [draft, setDraft] = useState("");
  const push = () => {
    const v = draft.trim();
    if (!v || items.length >= max) return;
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <div className="listInput">
      {items.length > 0 && (
        <ul>
          {items.map((it, i) => (
            <li key={`${it}-${i}`}>
              <span>{it}</span>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={remove} title={remove}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length < max && (
        <div className="row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            maxLength={240}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                push();
              }
            }}
          />
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
          min-height: 44px;
          padding: 0 12px;
          border: 1px solid var(--nl-border-strong);
          border-radius: 10px;
          background: var(--nl-bg-raised);
          color: var(--nl-text);
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}
