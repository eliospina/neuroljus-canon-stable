import { useRef, useState } from "react";
import {
  sanitizeProfile,
  type BotheringSound,
  type CalmItem,
  type SensoryProfile,
} from "@/lib/companion/profile";
import { PROFILE_OPTIONS, PROFILE_UI, type CompanionLang } from "@/lib/companion/i18n";

type Props = {
  lang: CompanionLang;
  initial: SensoryProfile;
  hasSaved: boolean;
  onSave: (profile: SensoryProfile) => void;
  onDelete: () => void;
  onClose: () => void;
};

type Choice = { value: string; picto: string; label: string };

function Choices({
  legend,
  choices,
  selected,
  onToggle,
  multi = false,
}: {
  legend: string;
  choices: Choice[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="choices" role={multi ? "group" : "radiogroup"}>
        {choices.map((c) => {
          const on = selected.includes(c.value);
          return (
            <button
              key={c.value}
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={on}
              className={on ? "on" : ""}
              onClick={() => onToggle(c.value)}
            >
              <span className="picto" aria-hidden="true">
                {c.picto}
              </span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>
      <style jsx>{`
        fieldset {
          border: 0;
          padding: 0;
          margin: 0 0 16px;
        }
        legend {
          font-weight: 600;
          font-size: 17px;
          margin-bottom: 8px;
        }
        .choices {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
          gap: 8px;
        }
        button {
          min-height: 84px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border-radius: 14px;
          border: 2px solid #ddd4c6;
          background: #fffdf9;
          color: #2c3532;
          font: inherit;
          font-size: 14px;
        }
        button.on {
          border-color: #3f5f57;
          background: #dfe7e1;
        }
        .picto {
          font-size: 32px;
          line-height: 1;
        }
        button:focus-visible {
          outline: 3px solid #8fb3a7;
          outline-offset: 2px;
        }
      `}</style>
    </fieldset>
  );
}

export default function ProfileEditor({ lang, initial, hasSaved, onSave, onDelete, onClose }: Props) {
  const t = PROFILE_UI[lang];
  const [p, setP] = useState<SensoryProfile>(initial);
  const [importError, setImportError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const opts = <K extends keyof typeof PROFILE_OPTIONS>(key: K): Choice[] =>
    Object.entries(PROFILE_OPTIONS[key]).map(([value, o]) => ({ value, picto: o.picto, label: o.label[lang] }));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "neuroljus-profile.json";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = sanitizeProfile(JSON.parse(await file.text()));
      if (!parsed) throw new Error("invalid");
      setP(parsed);
      setImportError(false);
    } catch {
      setImportError(true);
    }
  };

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <div className="inner">
        <div className="head">
          <h2 id="profile-title">{t.title}</h2>
          <button type="button" className="ghost" onClick={onClose}>
            {t.close}
          </button>
        </div>
        <p className="intro">{t.intro}</p>

        <label className="nameLabel" htmlFor="profile-name">
          {t.name}
        </label>
        <input
          id="profile-name"
          value={p.name}
          maxLength={40}
          autoComplete="off"
          onChange={(e) => setP({ ...p, name: e.target.value })}
        />

        <Choices
          legend={t.calmingSound}
          choices={opts("calmingSound")}
          selected={[p.calmingSound]}
          onToggle={(v) => setP({ ...p, calmingSound: v as SensoryProfile["calmingSound"] })}
        />
        <Choices
          legend={t.botheringSounds}
          multi
          choices={opts("botheringSounds")}
          selected={p.botheringSounds}
          onToggle={(v) => {
            const s = v as BotheringSound;
            setP({
              ...p,
              botheringSounds: p.botheringSounds.includes(s)
                ? p.botheringSounds.filter((x) => x !== s)
                : [...p.botheringSounds, s],
            });
          }}
        />
        <Choices
          legend={t.light}
          choices={opts("light")}
          selected={[p.light]}
          onToggle={(v) => setP({ ...p, light: v as SensoryProfile["light"] })}
        />
        <Choices
          legend={t.pauseVoice}
          choices={opts("pauseVoice")}
          selected={[p.pauseVoice]}
          onToggle={(v) => setP({ ...p, pauseVoice: v as SensoryProfile["pauseVoice"] })}
        />
        <Choices
          legend={t.space}
          choices={opts("space")}
          selected={[p.space]}
          onToggle={(v) => setP({ ...p, space: v as SensoryProfile["space"] })}
        />
        <Choices
          legend={t.visualCards}
          choices={opts("visualCards")}
          selected={[p.visualCards ? "yes" : "no"]}
          onToggle={(v) => setP({ ...p, visualCards: v === "yes" })}
        />
        <Choices
          legend={t.calmItem}
          choices={opts("calmItem")}
          selected={p.calmItem ? [p.calmItem] : []}
          onToggle={(v) => setP({ ...p, calmItem: p.calmItem === v ? null : (v as CalmItem) })}
        />

        <p className="local">{t.local}</p>
        <button type="button" className="save" onClick={() => onSave(sanitizeProfile(p) ?? p)}>
          {t.save}
        </button>
        <div className="row">
          <button type="button" className="ghost" onClick={exportJson}>
            {t.export}
          </button>
          <button type="button" className="ghost" onClick={() => fileInput.current?.click()}>
            {t.import}
          </button>
          {hasSaved && (
            <button type="button" className="ghost danger" onClick={onDelete}>
              {t.delete}
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => void importJson(e.target.files?.[0])}
        />
        {importError && (
          <p className="err" role="alert">
            {t.importError}
          </p>
        )}
      </div>
      <style jsx>{`
        .sheet {
          position: fixed;
          inset: 0;
          z-index: 40;
          background: #efe9df;
          overflow-y: auto;
          color: #2c3532;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }
        .inner {
          max-width: 640px;
          margin: 0 auto;
          padding: calc(16px + env(safe-area-inset-top)) 16px calc(32px + env(safe-area-inset-bottom));
        }
        .head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        h2 {
          margin: 0;
          font-size: 24px;
        }
        .intro,
        .local {
          color: #4f5b57;
          font-size: 15px;
        }
        .nameLabel {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
        }
        input:not([type="file"]) {
          width: 100%;
          box-sizing: border-box;
          min-height: 48px;
          border: 1px solid #cfc6b8;
          border-radius: 12px;
          padding: 0 12px;
          font: inherit;
          font-size: 17px;
          background: #fffdf9;
          margin-bottom: 18px;
        }
        .save {
          width: 100%;
          min-height: 56px;
          border: 0;
          border-radius: 14px;
          background: #3f5f57;
          color: #f6f2ea;
          font: inherit;
          font-size: 18px;
          font-weight: 600;
        }
        .row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .ghost {
          min-height: 44px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid #cfc6b8;
          background: transparent;
          color: #2c3532;
          font: inherit;
          font-size: 15px;
        }
        .danger {
          color: #8a3b2e;
          border-color: #e2c0b5;
        }
        .err {
          color: #8a3b2e;
        }
      `}</style>
    </div>
  );
}
