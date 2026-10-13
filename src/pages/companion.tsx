import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PlannedStep, PlannerInput, PlannerResult, ScenarioId, VisionSnapshot } from "@/lib/careProtocol/types";
import { readLatestLocalVisionSnapshot } from "@/lib/careProtocol/nlVisionBridge";
import { buildCarePlan } from "@/lib/careProtocol/planner";
import { useLang } from "@/components/SiteLayout";
import ProfileEditor from "@/components/companion/ProfileEditor";
import {
  applyProfile,
  defaultProfile,
  deleteProfile,
  readProfile,
  writeProfile,
  type ProfileConstraint,
  type SensoryProfile,
} from "@/lib/companion/profile";
import {
  phoneMapping,
  phoneStateAt,
  SECONDS_PER_MINUTE,
  totalMinutes,
  type PhoneState,
  type RunSpeed,
} from "@/lib/companion/phoneBody";
import { BrownNoise, requestWakeLock, softVibrate } from "@/lib/companion/phoneRuntime";
import { addRun, readRuns, type CompanionRun, type RunEnd } from "@/lib/companion/runLog";
import { helpfulSummary, OUTCOMES, rankRoutines, routineKey, setRunOutcome, type Outcome } from "@/lib/companion/outcomes";
import { addPatternNote } from "@/lib/carePatterns/localStore";
import { readIdeas } from "@/lib/ask/ideas";
import {
  DEFAULT_ENTITIES,
  homeAssistantScript,
  sanitizeEntities,
  type HomeEntities,
} from "@/lib/companion/homeAssistant";
import {
  BODIES,
  BODY_UI,
  CARD_PICTOS,
  COMMAND_LABELS,
  CONSTRAINT_TEXT,
  EXAMPLES,
  OUTCOME_MARK,
  OUTCOME_UI,
  fill,
  PHONE_ACTION_TEXT,
  PROFILE_OPTIONS,
  PROFILE_UI,
  SCENARIO_NAMES,
  SILENT_PHONE_TEXT,
  UI,
  VISUAL_CARDS,
  type BodyId,
  type CompanionLang,
} from "@/lib/companion/i18n";

const ENTITIES_KEY = "neuroljus.companion.ha_entities.v0";

type AgentResponse = {
  ok: true;
  source: "claude" | "fallback" | "risk_screen";
  notice: string | null;
  escalate: boolean;
  escalationMessage: string | null;
  interpretation: string;
  confidence: "low" | "medium" | "high";
  scenario: ScenarioId;
  plannerInput: PlannerInput;
  plan: PlannerResult;
};

type RunPhase = "idle" | "running" | "paused" | "done" | "stopped";

const MAX_CHARS = 500;

function constraintText(c: ProfileConstraint, lang: CompanionLang): string {
  const t = CONSTRAINT_TEXT[lang];
  switch (c.kind) {
    case "light_capped":
      return fill(t.light_capped, { from: c.from, to: c.to });
    case "more_space":
      return fill(t.more_space, { to: c.to.toFixed(1) });
    case "no_noise":
      return c.because === "silence" ? t.no_noise_silence : t.no_noise_hum;
    case "avoid_sounds":
      return fill(t.avoid_sounds, {
        sounds: c.sounds.map((s) => PROFILE_OPTIONS.botheringSounds[s].label[lang].toLowerCase()).join(", "),
      });
    case "calm_item": {
      const o = PROFILE_OPTIONS.calmItem[c.item];
      return fill(t.calm_item, { item: `${o.picto} ${o.label[lang].toLowerCase()}` });
    }
    default:
      return t[c.kind];
  }
}

function mmss(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function CompanionPage() {
  const [lang, setLang] = useLang("en");
  const copy = UI[lang];
  const pcopy = PROFILE_UI[lang];
  const ocopy = OUTCOME_UI[lang];
  const bcopy = BODY_UI[lang];

  const [text, setText] = useState("");
  // Set when this routine is a trial of an idea saved from Ask NeuroLjus (?idea=ID).
  const ideaId = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [vision, setVision] = useState<VisionSnapshot | null>(null);
  const [speed, setSpeed] = useState<RunSpeed>("real");

  const [phase, setPhase] = useState<RunPhase>("idle");
  const [minute, setMinute] = useState(0);
  const [audioOk, setAudioOk] = useState(true);
  const [profile, setProfile] = useState<SensoryProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [runs, setRuns] = useState<CompanionRun[]>([]);
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [rated, setRated] = useState<Outcome | null>(null);
  const [showHelps, setShowHelps] = useState(false);
  const [body, setBody] = useState<BodyId>("phone");
  const [entities, setEntities] = useState<HomeEntities>(DEFAULT_ENTITIES);
  const [copiedBody, setCopiedBody] = useState(false);

  const elapsedBefore = useRef(0); // ms accumulated before the current segment
  const segmentStart = useRef(0);
  const timer = useRef<number | null>(null);
  const noise = useRef<BrownNoise | null>(null);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);
  const notifiedOnce = useRef(false);

  useEffect(() => {
    try {
      setVision(readLatestLocalVisionSnapshot(window.localStorage));
    } catch {
      setVision(null);
    }
    try {
      const wanted = new URLSearchParams(window.location.search).get("idea");
      const idea = wanted ? readIdeas(window.localStorage).find((i) => i.id === wanted) : undefined;
      if (idea) {
        ideaId.current = idea.id;
        setText(idea.text.slice(0, MAX_CHARS));
      }
      setProfile(readProfile(window.localStorage));
      setRuns(readRuns(window.localStorage));
      const storedEntities = window.localStorage.getItem(ENTITIES_KEY);
      if (storedEntities) setEntities(sanitizeEntities(JSON.parse(storedEntities) as Partial<HomeEntities>));
    } catch {
      setProfile(null);
    }
  }, []);

  const ranked = useMemo(() => rankRoutines(runs), [runs]);

  const updateEntity = (key: keyof HomeEntities, value: string) => {
    const next = { ...entities, [key]: value };
    setEntities(next);
    try {
      window.localStorage.setItem(ENTITIES_KEY, JSON.stringify(sanitizeEntities(next)));
    } catch {
      /* storage unavailable */
    }
  };

  // The person's profile is a hard limit: fused in code, then the plan is rebuilt locally.
  const fusion = useMemo(() => (result ? applyProfile(result.plannerInput, profile) : null), [result, profile]);
  const plan = useMemo<PlannerResult | null>(() => (fusion ? buildCarePlan(fusion.input) : null), [fusion]);
  const noiseAllowed = fusion?.phone.noise ?? true;
  const steps = useMemo<PlannedStep[]>(() => plan?.steps ?? [], [plan]);
  const env = fusion?.input.environment;
  const total = totalMinutes(steps);
  const secPerMin = SECONDS_PER_MINUTE[speed];

  const state: PhoneState | null = useMemo(
    () => (env && phase !== "idle" ? phoneStateAt(steps, env, minute, { noise: noiseAllowed }) : null),
    [env, steps, minute, phase, noiseAllowed]
  );

  const clearTimer = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };

  const releaseBody = useCallback(() => {
    clearTimer();
    noise.current?.stop();
    noise.current = null;
    void wakeLock.current?.release().catch(() => undefined);
    wakeLock.current = null;
  }, []);

  useEffect(() => releaseBody, [releaseBody]);

  const logRun = useCallback(
    (ended: RunEnd) => {
      if (!result) return;
      setRated(null);
      try {
        const entry = addRun(window.localStorage, {
          scenario: result.scenario,
          commands: steps.map((s) => s.command),
          ended,
          ...(ideaId.current ? { ideaId: ideaId.current } : {}),
        });
        setLastRunId(entry.id);
      } catch {
        setLastRunId(null);
      }
    },
    [result, steps]
  );

  const tick = useCallback(() => {
    const ms = elapsedBefore.current + (performance.now() - segmentStart.current);
    setMinute(Math.min(total, ms / 1000 / secPerMin));
  }, [total, secPerMin]);

  const startTicking = useCallback(() => {
    segmentStart.current = performance.now();
    clearTimer();
    timer.current = window.setInterval(tick, 250);
  }, [tick]);

  const start = useCallback(async () => {
    if (!result || result.escalate || total <= 0) return;
    // Audio must start inside the tap so mobile browsers allow it.
    const engine = new BrownNoise();
    setAudioOk(engine.start());
    noise.current = engine;
    notifiedOnce.current = false;
    elapsedBefore.current = 0;
    setMinute(0);
    setPhase("running");
    startTicking();
    wakeLock.current = await requestWakeLock();
  }, [result, total, startTicking]);

  const pause = useCallback(() => {
    if (phase !== "running") return;
    elapsedBefore.current += performance.now() - segmentStart.current;
    clearTimer();
    noise.current?.setGain(0);
    setPhase("paused");
  }, [phase]);

  const resume = useCallback(() => {
    if (phase !== "paused") return;
    setPhase("running");
    startTicking();
  }, [phase, startTicking]);

  const stop = useCallback(() => {
    if (phase !== "running" && phase !== "paused") return;
    releaseBody();
    logRun("caregiver_pause");
    setPhase("stopped");
  }, [phase, releaseBody, logRun]);

  const close = useCallback(() => {
    releaseBody();
    setPhase("idle");
    setMinute(0);
  }, [releaseBody]);

  const rate = useCallback(
    (outcome: Outcome) => {
      if (!lastRunId || !result) return;
      try {
        const before = readRuns(window.localStorage);
        const run = setRunOutcome(window.localStorage, lastRunId, outcome);
        if (run && rated === null) {
          const key = routineKey(run.scenario, run.commands);
          addPatternNote({
            gesture: `Companion · ${SCENARIO_NAMES[lang][run.scenario]}`,
            context: run.commands.map((c) => COMMAND_LABELS[lang][c]).join(" → "),
            eased: outcome === "helped" ? ocopy.noteHelped : "",
            worsened: outcome === "worse" ? ocopy.noteWorse : "",
            uncertainty: outcome === "no_change" ? ocopy.noteNoChange : ocopy.noteUncertainty,
            seenBefore: before.some((r) => r.id !== run.id && r.outcome && routineKey(r.scenario, r.commands) === key),
          });
        }
        setRuns(readRuns(window.localStorage));
      } catch {
        /* storage unavailable */
      }
      setRated(outcome);
    },
    [lastRunId, result, rated, lang, ocopy]
  );

  // Drive the body from the deterministic phone state.
  useEffect(() => {
    if (!state) return;
    if (phase === "running") noise.current?.setGain(state.noiseGain);
    if (state.notified && !notifiedOnce.current) {
      notifiedOnce.current = true;
      softVibrate();
    }
    if (state.done && phase === "running") {
      releaseBody();
      softVibrate();
      logRun("completed");
      setPhase("done");
    }
  }, [state, phase, releaseBody, logRun]);

  // Wake Lock is dropped when the tab is hidden; take it back on return.
  useEffect(() => {
    const onVisible = async () => {
      if (document.visibilityState === "visible" && phase === "running" && !wakeLock.current) {
        wakeLock.current = await requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [phase]);

  const prepare = useCallback(
    async (input?: string) => {
      const value = (input ?? text).trim();
      if (!value || busy) return;
      setBusy(true);
      setError(null);
      setPhase("idle");
      try {
        const r = await fetch("/api/protocol-from-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Only an anonymous summary of what helped before: scenario, commands, counts.
          body: JSON.stringify({ text: value, lang, visionContext: vision, helpfulRoutines: helpfulSummary(runs) }),
        });
        const j = (await r.json()) as AgentResponse | { ok: false; error?: string };
        if (!r.ok || !j.ok) {
          setError((j as { error?: string }).error || copy.error);
          setResult(null);
        } else {
          setResult(j);
          window.setTimeout(() => document.getElementById("plan")?.scrollIntoView({ block: "start" }), 50);
        }
      } catch {
        setError(copy.error);
        setResult(null);
      } finally {
        setBusy(false);
      }
    },
    [text, busy, lang, vision, runs, copy.error]
  );

  const bodyPackage = useMemo(() => {
    if (!plan || !fusion || body === "phone") return "";
    if (body === "home") {
      const card = VISUAL_CARDS[lang][fusion.input.scenario];
      return homeAssistantScript({
        routine: fusion.input.routineName,
        scenario: fusion.input.scenario,
        environment: fusion.input.environment,
        steps: plan.steps,
        entities: sanitizeEntities(entities),
        notifyMessage: fill(bcopy.notifyMessage, { routine: SCENARIO_NAMES[lang][fusion.input.scenario] }),
        caregiverNotes: {
          step_back: fill(bcopy.noteStepBack, { distance: fusion.input.environment.distance.toFixed(1) }),
          pause_interaction: bcopy.notePause,
          offer_visual_card: fill(bcopy.noteCard, { card }),
        },
      });
    }
    return JSON.stringify(plan.adapterPackets[body], null, 2);
  }, [plan, fusion, body, entities, lang, bcopy]);

  const copyBody = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bodyPackage);
      setCopiedBody(true);
      window.setTimeout(() => setCopiedBody(false), 1800);
    } catch {
      setCopiedBody(false);
    }
  }, [bodyPackage]);

  const onPhone = (step: PlannedStep) => phoneMapping[step.command].onPhone && (step.command !== "reduce_sound" || noiseAllowed);

  const actionText = (step: PlannedStep) => {
    if (step.command === "reduce_sound" && !noiseAllowed) return SILENT_PHONE_TEXT[lang];
    const m = phoneMapping[step.command];
    return fill(PHONE_ACTION_TEXT[lang][m.action], {
      light: env?.light ?? 0,
      sound: env?.sound ?? 0,
      distance: env ? env.distance.toFixed(1) : "",
    });
  };

  const cardKey: ScenarioId | "escalated" = result?.escalate ? "escalated" : result?.scenario ?? "sensory_overload";
  const running = phase === "running" || phase === "paused";
  const profileName = profile?.name.trim() || pcopy.person;
  const calmItem = profile?.calmItem ? PROFILE_OPTIONS.calmItem[profile.calmItem] : null;
  const activeStep = state && state.activeStep >= 0 && state.activeStep < steps.length ? steps[state.activeStep] : null;
  const remaining = (total - minute) * secPerMin;

  return (
    <>
      <Head>
        <title>NeuroLjus Companion — a care robot that starts on your phone</title>
        <meta
          name="description"
          content="Describe what is happening. Claude interprets, a deterministic planner decides, the caregiver presses Start. Today the body is a phone; tomorrow a ROS2 robot."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#efe9df" />
      </Head>

      <div className="page">
        <header className="top">
          <Link href="/" className="brand">
            NeuroLjus <span>Companion</span>
          </Link>
          <div className="lang" role="group" aria-label="Language">
            {(["es", "en", "sv"] as CompanionLang[]).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <main>
          <section className="hero">
            <p className="bodyTag">
              <span aria-hidden="true">📱</span> {copy.body}
            </p>
            <h1>{copy.heroTitle}</h1>
            <p className="sub">{copy.heroSub}</p>
            <ol className="how">
              <li>
                <b>1</b>
                {copy.how1}
              </li>
              <li>
                <b>2</b>
                {copy.how2}
              </li>
              <li>
                <b>3</b>
                {copy.how3}
              </li>
            </ol>
            <button type="button" className="profileChip" onClick={() => setEditingProfile(true)}>
              {profile ? (
                <>
                  <span aria-hidden="true">🧩</span> {pcopy.edit}: <b>{profileName}</b> ✓
                </>
              ) : (
                <>
                  <span aria-hidden="true">🧩</span> {pcopy.create}
                </>
              )}
            </button>
            <button type="button" className="profileChip" onClick={() => setShowHelps(true)}>
              <span aria-hidden="true">📈</span> {ocopy.open}
              {ranked.length > 0 ? ` (${ranked.length})` : ""}
            </button>
          </section>

          <section className="card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void prepare();
              }}
            >
              <label htmlFor="what" className="label">
                {copy.label}
              </label>
              <textarea
                id="what"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                placeholder={copy.placeholder}
                rows={3}
                maxLength={MAX_CHARS}
                enterKeyHint="go"
              />
              <p className="hint">
                <span aria-hidden="true">🎙️</span> {copy.dictate} <span className="count">{text.length}/{MAX_CHARS}</span>
              </p>
              <button type="submit" className="primary wide" disabled={busy || !text.trim()}>
                {busy ? copy.planning : copy.plan}
              </button>
            </form>

            <p className="label small">{copy.examples}</p>
            <div className="examples">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.lang}
                  type="button"
                  className={`example ${ex.escalation ? "warn" : ""}`}
                  disabled={busy}
                  onClick={() => {
                    setText(ex.text);
                    void prepare(ex.text);
                  }}
                >
                  <b>{ex.lang.toUpperCase()}</b>
                  <span>{ex.text}</span>
                </button>
              ))}
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </section>

          {result && (
            <section id="plan" className="results" aria-live="polite">
              {!(result.escalate && result.interpretation === result.escalationMessage) && (
              <div className="card">
                <p className="label small">{copy.interpretation}</p>
                <p className="interp">{result.interpretation}</p>
                <p className="meta">
                  <span>
                    {copy.confidence}: {copy[`conf_${result.confidence}`]}
                  </span>
                  <span>{copy[`source_${result.source}`]}</span>
                  {!result.escalate && <span>{SCENARIO_NAMES[lang][result.scenario]}</span>}
                </p>
                {result.notice && !result.escalate && <p className="notice">{result.notice}</p>}
              </div>
              )}

              {result.escalate ? (
                <div className="card escalation" role="alert">
                  <p className="big">{result.escalationMessage}</p>
                  <p>{copy.noAuto}</p>
                  <p className="only">
                    {steps.map((s) => COMMAND_LABELS[lang][s.command]).join(" · ")}
                  </p>
                  <a className="call" href="tel:112">
                    {copy.call112}
                  </a>
                </div>
              ) : (
                <>
                  <div className="card">
                    <div className="planHead">
                      <h2>{copy.planTitle}</h2>
                      <span>
                        {total} {copy.minutes}
                      </span>
                    </div>
                    {env && (
                      <dl className="targets">
                        <div>
                          <dt>{copy.light}</dt>
                          <dd>{env.light}%</dd>
                        </div>
                        <div>
                          <dt>{copy.sound}</dt>
                          <dd>{env.sound}%</dd>
                        </div>
                        <div>
                          <dt>{copy.distance}</dt>
                          <dd>{env.distance.toFixed(1)} m</dd>
                        </div>
                      </dl>
                    )}
                    <ol className="timeline">
                      {steps.map((step, i) => (
                        <li key={`${step.command}-${i}`}>
                          <span className="min">+{step.offsetMinutes}′</span>
                          <div>
                            <strong>{COMMAND_LABELS[lang][step.command]}</strong>
                            <p>
                              <em className={onPhone(step) ? "who phone" : "who you"}>
                                {onPhone(step) ? copy.phone : copy.you}
                              </em>
                              {actionText(step)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    {profile && fusion && fusion.constraints.length > 0 && (
                      <div className="respects">
                        <strong>{fill(pcopy.respects, { name: profileName })}:</strong>{" "}
                        {fusion.constraints.map((c) => constraintText(c, lang)).join(" · ")}
                      </div>
                    )}
                  </div>

                  <div className="bodies" role="group" aria-label={bcopy.label}>
                    <span className="label small">{bcopy.label}</span>
                    <div className="bodyRow">
                      {BODIES.map((b) => (
                        <button key={b} type="button" aria-pressed={body === b} onClick={() => setBody(b)}>
                          {bcopy[b]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {body !== "phone" && plan && (
                    <div className="card packet">
                      <p className="packetHelp">
                        {body === "home"
                          ? bcopy.homeHelp
                          : fill(bcopy.packetHelp, { route: plan.adapterPackets[body].route })}
                      </p>
                      {body === "home" && (
                        <div className="entities">
                          {(
                            [
                              ["light", bcopy.entLight],
                              ["mediaPlayer", bcopy.entMedia],
                              ["notify", bcopy.entNotify],
                            ] as Array<[keyof HomeEntities, string]>
                          ).map(([key, label]) => (
                            <label key={key}>
                              <span>{label}</span>
                              <input
                                value={entities[key]}
                                onChange={(e) => updateEntity(key, e.target.value)}
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                              />
                            </label>
                          ))}
                        </div>
                      )}
                      <pre>{bodyPackage}</pre>
                      <button type="button" className="primary wide" onClick={() => void copyBody()}>
                        {copiedBody ? `✓ ${bcopy.copied}` : bcopy.copy}
                      </button>
                    </div>
                  )}

                  {body === "phone" && (
                  <div className="startBar">
                    <div className="speed" role="group" aria-label="Speed">
                      {(["real", "demo"] as RunSpeed[]).map((s) => (
                        <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>
                          {s === "real" ? copy.speedReal : copy.speedDemo}
                        </button>
                      ))}
                    </div>
                    <button type="button" className="primary start" onClick={() => void start()}>
                      ▶ {copy.start}
                    </button>
                  </div>
                  )}
                </>
              )}
            </section>
          )}

          <footer className="foot">
            <p>{copy.rules}</p>
            <p>{copy.privacy}</p>
            <p>{copy.bodyNote}</p>
            <nav>
              <Link href="/care-agent">{copy.navAgent}</Link>
              <Link href="/labs/robot-interface">{copy.navWorkspace}</Link>
              <Link href="/">{copy.navHome}</Link>
            </nav>
          </footer>
        </main>
      </div>

      {editingProfile && (
        <ProfileEditor
          lang={lang}
          initial={profile ?? defaultProfile()}
          hasSaved={profile !== null}
          onClose={() => setEditingProfile(false)}
          onSave={(p) => {
            try {
              writeProfile(window.localStorage, p);
            } catch {
              /* storage unavailable: keep it for this session */
            }
            setProfile(p);
            setEditingProfile(false);
          }}
          onDelete={() => {
            try {
              deleteProfile(window.localStorage);
            } catch {
              /* nothing stored */
            }
            setProfile(null);
            setEditingProfile(false);
          }}
        />
      )}

      {showHelps && (
        <div className="helps" role="dialog" aria-modal="true" aria-labelledby="helps-title">
          <div className="helpsInner">
            <div className="planHead">
              <h2 id="helps-title">{ocopy.title}</h2>
              <button type="button" className="ghostBtn" onClick={() => setShowHelps(false)}>
                {ocopy.close}
              </button>
            </div>
            <p className="sub">{ranked.length > 0 ? ocopy.intro : ocopy.empty}</p>
            <ol className="helpsList">
              {ranked.map((r) => (
                <li key={r.key}>
                  <strong>{SCENARIO_NAMES[lang][r.scenario]}</strong>
                  <p>{r.commands.map((c) => COMMAND_LABELS[lang][c]).join(" · ")}</p>
                  <p className="counts">
                    <span className="up">{fill(ocopy.ofRuns, { helped: r.helped, rated: r.rated })}</span>
                    {r.worse > 0 && <span className="down">{fill(ocopy.worseCount, { worse: r.worse })}</span>}
                  </p>
                </li>
              ))}
            </ol>
            <p className="sharedNote">{ocopy.shared}</p>
            <p className="sharedNote">
              <Link href="/labs/pattern-notebook">Pattern Notebook →</Link>
            </p>
          </div>
        </div>
      )}

      {phase !== "idle" && result && (
        <div className="runner" role="dialog" aria-modal="true" aria-label={copy.title}>
          {running && state && (
            <>
              <div className="runTop">
                <span>
                  {activeStep
                    ? `${copy.step} ${state.activeStep + 1} ${copy.of} ${steps.length} · ${COMMAND_LABELS[lang][activeStep.command]}`
                    : ""}
                </span>
                <span>
                  {phase === "paused" ? copy.paused : `${mmss(remaining)} ${copy.left}`}
                </span>
              </div>

              <div className="stage">
                {state.card ? (
                  <div className="visualCard">
                    <div className="pictos" aria-hidden="true">
                      {CARD_PICTOS[cardKey].map((p) => (
                        <span key={p}>{p}</span>
                      ))}
                    </div>
                    <p>{VISUAL_CARDS[lang][cardKey]}</p>
                    {calmItem && (
                      <p className="calmItem">
                        {pcopy.yourCalm}: <span aria-hidden="true">{calmItem.picto}</span> {calmItem.label[lang]}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="calm">
                    <svg viewBox="0 0 120 120" aria-hidden="true">
                      <circle cx="60" cy="60" r="52" className="ringBg" />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        className="ring"
                        strokeDasharray={`${(total > 0 ? minute / total : 0) * 326.7} 326.7`}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <p>{state.quiet ? copy.quiet : mmss(remaining)}</p>
                    {state.quiet && profile?.pauseVoice === "silence" && (
                      <p className="noVoice">
                        <span aria-hidden="true">🤐</span> {pcopy.noVoice}
                      </p>
                    )}
                  </div>
                )}
                {state.caregiverHints.includes("step_back") && env && (
                  <p className="youHint">
                    <b>{copy.you}:</b> {fill(PHONE_ACTION_TEXT[lang].caregiver_hint, { distance: env.distance.toFixed(1) })}
                  </p>
                )}
                {!audioOk && <p className="youHint">{copy.soundOff}</p>}
              </div>
            </>
          )}

          {(phase === "done" || phase === "stopped") && (
            <div className="stage end">
              <h2>{phase === "done" ? copy.doneTitle : copy.stoppedTitle}</h2>
              <p>{phase === "done" ? copy.doneSub : copy.stoppedSub}</p>
              {lastRunId && (
                <div className="rate">
                  <p className="ask">{ocopy.ask}</p>
                  <div className="rateRow" role="group" aria-label={ocopy.ask}>
                    {OUTCOMES.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className={`rateBtn ${rated === o ? "on" : ""}`}
                        aria-pressed={rated === o}
                        onClick={() => rate(o)}
                      >
                        <span aria-hidden="true">{OUTCOME_MARK[o]}</span>
                        {ocopy[o]}
                      </button>
                    ))}
                  </div>
                  {rated && <p className="saved">{ocopy.saved}</p>}
                </div>
              )}
              <button type="button" className="primary wide" onClick={close}>
                {copy.back}
              </button>
            </div>
          )}

          {state && <div className="dim" style={{ opacity: phase === "running" || phase === "paused" ? state.dim : 0 }} aria-hidden="true" />}

          {running && (
            <div className="controls">
              {phase === "running" ? (
                <button type="button" className="ctl" onClick={pause}>
                  ⏸ {copy.pause}
                </button>
              ) : (
                <button type="button" className="ctl" onClick={resume}>
                  ▶ {copy.resume}
                </button>
              )}
              <button type="button" className="ctl stop" onClick={stop}>
                ■ {copy.stop}
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #efe9df;
          color: #2c3532;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          line-height: 1.5;
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          max-width: 640px;
          margin: 0 auto;
        }
        .top :global(.brand) {
          color: #2c3532;
          text-decoration: none;
          font-weight: 700;
          font-size: 17px;
        }
        .top :global(.brand span) {
          font-weight: 400;
          color: #5c6b66;
        }
        .lang {
          display: flex;
          gap: 4px;
        }
        .lang button,
        .speed button {
          min-height: 40px;
          min-width: 44px;
          border: 1px solid #cfc6b8;
          background: transparent;
          color: #3e4a46;
          border-radius: 10px;
          font: inherit;
          font-size: 14px;
        }
        .lang button[aria-pressed="true"],
        .speed button[aria-pressed="true"] {
          background: #3f5f57;
          border-color: #3f5f57;
          color: #f6f2ea;
        }
        main {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 16px 48px;
        }
        .hero {
          padding: 8px 2px 18px;
        }
        .bodyTag {
          display: inline-block;
          margin: 0 0 10px;
          padding: 6px 12px;
          border-radius: 999px;
          background: #dfe7e1;
          color: #2f4d45;
          font-size: 14px;
          font-weight: 600;
        }
        h1 {
          font-size: 28px;
          line-height: 1.2;
          margin: 0 0 10px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .sub {
          margin: 0 0 14px;
          font-size: 16px;
          color: #46524e;
        }
        .how {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .how li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          background: #f7f3ec;
          border: 1px solid #ddd4c6;
          border-radius: 999px;
          padding: 6px 12px 6px 6px;
        }
        .how b {
          display: inline-grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #3f5f57;
          color: #f6f2ea;
          font-size: 12px;
        }
        .card {
          background: #f8f5ef;
          border: 1px solid #ddd4c6;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 14px;
        }
        .label {
          display: block;
          font-weight: 600;
          margin: 0 0 8px;
          font-size: 16px;
        }
        .label.small {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6b7772;
          margin-top: 14px;
        }
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #cfc6b8;
          border-radius: 12px;
          padding: 12px;
          font: inherit;
          font-size: 17px;
          background: #fffdf9;
          color: #2c3532;
          resize: vertical;
        }
        textarea:focus,
        button:focus-visible,
        a:focus-visible {
          outline: 3px solid #8fb3a7;
          outline-offset: 2px;
        }
        .hint {
          display: flex;
          gap: 6px;
          align-items: baseline;
          font-size: 13px;
          color: #6b7772;
          margin: 6px 0 12px;
        }
        .count {
          margin-left: auto;
          font-variant-numeric: tabular-nums;
        }
        .primary {
          min-height: 52px;
          border: 0;
          border-radius: 14px;
          background: #3f5f57;
          color: #f6f2ea;
          font: inherit;
          font-size: 17px;
          font-weight: 600;
          padding: 0 20px;
        }
        .primary:disabled {
          opacity: 0.5;
        }
        .wide {
          width: 100%;
        }
        .examples {
          display: grid;
          gap: 8px;
        }
        .example {
          display: flex;
          gap: 10px;
          text-align: left;
          align-items: flex-start;
          min-height: 48px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #ddd4c6;
          background: #fffdf9;
          color: #2c3532;
          font: inherit;
          font-size: 15px;
        }
        .example b {
          font-size: 12px;
          color: #3f5f57;
          padding-top: 2px;
        }
        .example.warn {
          border-color: #e2c9a4;
          background: #fbf3e6;
        }
        .error {
          color: #8a3b2e;
          margin: 10px 0 0;
        }
        .interp {
          font-size: 18px;
          margin: 0 0 8px;
        }
        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 0;
        }
        .meta span {
          font-size: 13px;
          background: #ebe5da;
          border-radius: 999px;
          padding: 3px 10px;
          color: #46524e;
        }
        .notice {
          font-size: 14px;
          color: #7a5a2a;
          margin: 10px 0 0;
        }
        .escalation {
          background: #fbf0e3;
          border-color: #e2c9a4;
        }
        .only {
          font-size: 14px;
          color: #6d4d1f;
          margin: 0;
        }
        .escalation .big {
          font-size: 19px;
          font-weight: 600;
          margin: 0 0 6px;
        }
        .call {
          display: block;
          text-align: center;
          margin-top: 12px;
          min-height: 52px;
          line-height: 52px;
          border-radius: 14px;
          background: #9a4a36;
          color: #fff8f2;
          font-weight: 700;
          font-size: 18px;
          text-decoration: none;
        }
        .profileChip {
          margin-top: 12px;
          min-height: 48px;
          width: 100%;
          text-align: left;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px dashed #b9ae9c;
          background: #f7f3ec;
          color: #2c3532;
          font: inherit;
          font-size: 16px;
        }
        .respects {
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: #dfe7e1;
          color: #2f4d45;
          font-size: 15px;
        }
        .calmItem {
          font-size: 20px !important;
          font-weight: 500 !important;
          margin-top: 14px !important;
          color: #3f5f57;
        }
        .noVoice {
          font-size: 18px !important;
          color: #3f5f57;
        }
        .rate {
          width: 100%;
          max-width: 520px;
          margin-bottom: 18px;
        }
        .ask {
          font-weight: 600;
          margin: 0 0 8px !important;
        }
        .rateRow {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .rateBtn {
          min-height: 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          border-radius: 14px;
          border: 2px solid #d6cdbf;
          background: #fbf8f2;
          color: #2c3532;
          font: inherit;
          font-size: 16px;
          font-weight: 600;
        }
        .rateBtn span {
          font-size: 22px;
        }
        .rateBtn.on {
          border-color: #3f5f57;
          background: #dfe7e1;
        }
        .saved {
          font-size: 14px !important;
          color: #3f5f57;
          margin: 8px 0 0 !important;
        }
        .helps {
          position: fixed;
          inset: 0;
          z-index: 40;
          background: #efe9df;
          color: #2c3532;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          overflow-y: auto;
        }
        .helps h2 {
          margin: 0;
          font-size: 24px;
          color: #2c3532;
        }
        .helpsList strong {
          color: #2c3532;
        }
        .helpsInner {
          max-width: 640px;
          margin: 0 auto;
          padding: calc(16px + env(safe-area-inset-top)) 16px 32px;
        }
        .ghostBtn {
          min-height: 44px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid #cfc6b8;
          background: transparent;
          color: #2c3532;
          font: inherit;
        }
        .helpsList {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .helpsList li {
          background: #f8f5ef;
          border: 1px solid #ddd4c6;
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 8px;
        }
        .helpsList p {
          margin: 2px 0 0;
          font-size: 14px;
          color: #4f5b57;
        }
        .counts {
          display: flex;
          gap: 10px;
        }
        .up {
          color: #2f4d45;
          font-weight: 600;
        }
        .down {
          color: #8a3b2e;
        }
        .sharedNote {
          font-size: 13px;
          color: #6b7772;
        }
        .sharedNote :global(a) {
          color: #3f5f57;
        }
        .planHead {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .planHead h2 {
          margin: 0;
          font-size: 20px;
        }
        .planHead span {
          color: #6b7772;
        }
        .targets {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 12px 0;
        }
        .targets div {
          background: #ebe5da;
          border-radius: 12px;
          padding: 8px 10px;
        }
        .targets dt {
          font-size: 12px;
          color: #6b7772;
        }
        .targets dd {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        .timeline {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .timeline li {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-top: 1px solid #e6dfd3;
        }
        .min {
          min-width: 44px;
          font-variant-numeric: tabular-nums;
          color: #3f5f57;
          font-weight: 600;
        }
        .timeline strong {
          display: block;
          font-size: 16px;
        }
        .timeline p {
          margin: 2px 0 0;
          font-size: 14px;
          color: #4f5b57;
        }
        .who {
          font-style: normal;
          font-size: 12px;
          font-weight: 700;
          border-radius: 6px;
          padding: 1px 6px;
          margin-right: 6px;
        }
        .who.phone {
          background: #dfe7e1;
          color: #2f4d45;
        }
        .who.you {
          background: #f1e3cd;
          color: #6d4d1f;
        }
        .bodies {
          margin: 4px 0 12px;
        }
        .bodyRow {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .bodyRow button {
          min-height: 48px;
          border: 1px solid #cfc6b8;
          background: transparent;
          color: #3e4a46;
          border-radius: 12px;
          font: inherit;
          font-size: 14px;
          padding: 0 6px;
        }
        .bodyRow button[aria-pressed="true"] {
          background: #3f5f57;
          border-color: #3f5f57;
          color: #f6f2ea;
        }
        .packetHelp {
          margin: 0 0 10px;
          font-size: 14px;
          color: #4f5b57;
        }
        .entities {
          display: grid;
          gap: 8px;
          margin-bottom: 10px;
        }
        .entities label {
          display: grid;
          gap: 2px;
          font-size: 13px;
          color: #6b7772;
        }
        .entities input {
          min-height: 44px;
          border: 1px solid #cfc6b8;
          border-radius: 10px;
          padding: 0 10px;
          font: 15px ui-monospace, SFMono-Regular, Menlo, monospace;
          background: #fffdf9;
          color: #2c3532;
        }
        .packet pre {
          margin: 0 0 10px;
          max-height: 360px;
          overflow: auto;
          background: #2f3a37;
          color: #e9efe9;
          border-radius: 12px;
          padding: 12px;
          font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
          white-space: pre;
        }
        .startBar {
          position: sticky;
          bottom: 0;
          background: #efe9df;
          padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
          display: grid;
          gap: 8px;
        }
        .speed {
          display: flex;
          gap: 6px;
        }
        .speed button {
          flex: 1;
        }
        .start {
          min-height: 60px;
          font-size: 20px;
        }
        .foot {
          margin-top: 18px;
          font-size: 13px;
          color: #6b7772;
        }
        .foot p {
          margin: 0 0 6px;
        }
        .foot nav {
          display: flex;
          gap: 14px;
          margin-top: 10px;
        }
        .foot :global(a) {
          color: #3f5f57;
        }

        .runner {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: #e8e1d5;
          color: #2c3532;
          display: flex;
          flex-direction: column;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }
        .runTop {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: calc(14px + env(safe-area-inset-top)) 18px 0;
          font-size: 15px;
          color: #4f5b57;
          font-variant-numeric: tabular-nums;
        }
        .stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 16px 20px 150px;
          text-align: center;
        }
        .visualCard {
          width: 100%;
          max-width: 520px;
          background: #fbf8f2;
          border-radius: 24px;
          padding: 28px 20px;
          border: 1px solid #d9cfbf;
        }
        .pictos {
          display: flex;
          justify-content: center;
          gap: 14px;
          font-size: 52px;
          margin-bottom: 14px;
        }
        .visualCard p {
          font-size: 26px;
          line-height: 1.3;
          margin: 0;
          font-weight: 600;
        }
        .calm svg {
          width: 220px;
          height: 220px;
        }
        .ringBg {
          fill: none;
          stroke: #d6cdbf;
          stroke-width: 6;
        }
        .ring {
          fill: none;
          stroke: #6f9488;
          stroke-width: 6;
          stroke-linecap: round;
          transition: stroke-dasharray 1s linear;
        }
        .calm p {
          font-size: 26px;
          margin: 8px 0 0;
          font-variant-numeric: tabular-nums;
        }
        .youHint {
          margin: 18px 0 0;
          font-size: 17px;
          background: #f1e3cd;
          border-radius: 14px;
          padding: 10px 14px;
          max-width: 520px;
        }
        .end h2 {
          font-size: 26px;
          margin: 0 0 8px;
        }
        .end p {
          margin: 0 0 20px;
          font-size: 17px;
        }
        .dim {
          position: fixed;
          inset: 0;
          background: #000;
          pointer-events: none;
          z-index: 60;
          transition: opacity 2s linear;
        }
        .controls {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 70;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px 16px calc(16px + env(safe-area-inset-bottom));
        }
        .ctl {
          min-height: 72px;
          border-radius: 18px;
          border: 0;
          font: inherit;
          font-size: 22px;
          font-weight: 700;
          background: #f6f2ea;
          color: #2c3532;
        }
        .ctl.stop {
          background: #9a4a36;
          color: #fff8f2;
        }
        @media (min-width: 720px) {
          h1 {
            font-size: 36px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .dim,
          .ring {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
