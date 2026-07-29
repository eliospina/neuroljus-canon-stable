/**
 * Scientific signal simulation for NL-VISION metrics.
 *
 * Interprets measurable prototype signals into structured hypotheses
 * for caregiver reflection — not emotion labels, not diagnosis, not mind-reading.
 */

export type VisionMetricsInput = {
  hasFace?: unknown;
  handsAvg?: unknown;
  handNearPct?: unknown;
  faceMoveAvg?: unknown;
  handsMoveAvg?: unknown;
  blinksPerMin?: unknown;
  earAvg?: unknown;
  mouthOpenAvg?: unknown;
};

export type ScientificBand = "low" | "moderate" | "elevated" | "unavailable";

export type ScientificReading = {
  usable: boolean;
  facePresent: boolean;
  handsAvg: number;
  handNearPct: number;
  faceMove: number;
  handsMove: number;
  blinksPerMin: number;
  earAvg: number;
  mouthOpenAvg: number;
  movementBand: ScientificBand;
  handNearBand: ScientificBand;
  blinkBand: ScientificBand;
  /** Deterministic caregiver-facing simulation text. */
  summaryLines: string[];
  protocolHints: string[];
};

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function movementBand(faceMove: number, handsMove: number): ScientificBand {
  const peak = Math.max(faceMove, handsMove);
  if (peak <= 0) return "unavailable";
  if (peak < 0.008) return "low";
  if (peak < 0.02) return "moderate";
  return "elevated";
}

function handNearBand(pct: number, hasFace: boolean, handsAvg: number): ScientificBand {
  if (!hasFace || handsAvg < 0.2) return "unavailable";
  if (pct < 0.15) return "low";
  if (pct < 0.35) return "moderate";
  return "elevated";
}

function blinkBand(blinks: number, hasFace: boolean): ScientificBand {
  if (!hasFace) return "unavailable";
  // Rough adult resting blink rates often cited ~10–20/min; used only as relative bands.
  if (blinks < 6) return "low";
  if (blinks <= 25) return "moderate";
  return "elevated";
}

export function buildScientificReading(
  metrics: VisionMetricsInput | null | undefined,
  lang: "sv" | "en" | "es" = "en"
): ScientificReading {
  if (!metrics || typeof metrics !== "object") {
    return emptyReading(lang);
  }

  const facePresent = metrics.hasFace === true;
  const handsAvg = num(metrics.handsAvg);
  const handNearPct = num(metrics.handNearPct);
  const faceMove = num(metrics.faceMoveAvg);
  const handsMove = num(metrics.handsMoveAvg);
  const blinksPerMin = num(metrics.blinksPerMin);
  const earAvg = num(metrics.earAvg);
  const mouthOpenAvg = num(metrics.mouthOpenAvg);

  const usable = facePresent || handsAvg > 0.15;
  if (!usable) return emptyReading(lang);

  const movement = movementBand(faceMove, handsMove);
  const near = handNearBand(handNearPct, facePresent, handsAvg);
  const blink = blinkBand(blinksPerMin, facePresent);

  const L = copy(lang);
  const summaryLines = [
    L.header,
    facePresent ? L.faceYes : L.faceNo,
    L.hands(handsAvg),
    L.near(Math.round(handNearPct * 100), near),
    L.move(faceMove, handsMove, movement),
    facePresent ? L.blink(blinksPerMin, blink) : L.blinkUnavailable,
    facePresent ? L.earMouth(earAvg, mouthOpenAvg) : null,
    L.boundary,
  ].filter((line): line is string => !!line);

  const protocolHints: string[] = [];
  if (movement === "elevated" || near === "elevated") {
    protocolHints.push(L.hintSettle);
  }
  if (blink === "elevated" || near === "elevated") {
    protocolHints.push(L.hintObserve);
  }
  if (movement === "low" && near === "low") {
    protocolHints.push(L.hintSteady);
  }
  protocolHints.push(L.hintCaregiver);

  return {
    usable: true,
    facePresent,
    handsAvg,
    handNearPct,
    faceMove,
    handsMove,
    blinksPerMin,
    earAvg,
    mouthOpenAvg,
    movementBand: movement,
    handNearBand: near,
    blinkBand: blink,
    summaryLines,
    protocolHints,
  };
}

export function formatScientificSimulation(
  metrics: VisionMetricsInput | null | undefined,
  lang: "sv" | "en" | "es" = "en"
): string {
  const reading = buildScientificReading(metrics, lang);
  return [...reading.summaryLines, "", ...reading.protocolHints.map((h) => `• ${h}`)].join("\n");
}

function emptyReading(lang: "sv" | "en" | "es"): ScientificReading {
  const L = copy(lang);
  return {
    usable: false,
    facePresent: false,
    handsAvg: 0,
    handNearPct: 0,
    faceMove: 0,
    handsMove: 0,
    blinksPerMin: 0,
    earAvg: 0,
    mouthOpenAvg: 0,
    movementBand: "unavailable",
    handNearBand: "unavailable",
    blinkBand: "unavailable",
    summaryLines: [L.header, L.noSignal, L.boundary],
    protocolHints: [L.hintRunCamera, L.hintCaregiver],
  };
}

function bandWord(band: ScientificBand, lang: "sv" | "en" | "es"): string {
  if (lang === "sv") {
    if (band === "low") return "låg";
    if (band === "moderate") return "måttlig";
    if (band === "elevated") return "förhöjd";
    return "otillgänglig";
  }
  if (lang === "es") {
    if (band === "low") return "baja";
    if (band === "moderate") return "moderada";
    if (band === "elevated") return "elevada";
    return "no disponible";
  }
  if (band === "low") return "low";
  if (band === "moderate") return "moderate";
  if (band === "elevated") return "elevated";
  return "unavailable";
}

function copy(lang: "sv" | "en" | "es") {
  if (lang === "sv") {
    return {
      header: "Vetenskaplig signalsimulering (NL-VISION, lokal prototyp):",
      faceYes: "Ansikte: detekterat i senaste fönstret.",
      faceNo: "Ansikte: inte detekterat i senaste fönstret.",
      hands: (n: number) => `Händer synliga (medel): ${n.toFixed(2)}.`,
      near: (pct: number, band: ScientificBand) =>
        `Hand nära ansikte: ${pct}% av tiden (band: ${bandWord(band, "sv")}).`,
      move: (f: number, h: number, band: ScientificBand) =>
        `Rörelseindex — ansikte ${f.toFixed(4)}, händer ${h.toFixed(4)} (band: ${bandWord(band, "sv")}).`,
      blink: (n: number, band: ScientificBand) =>
        `Blinkningar/min: ${n.toFixed(1)} (band: ${bandWord(band, "sv")}; relativ jämförelse, ej klinisk norm).`,
      blinkUnavailable: "Blinkningar: otillgängliga utan ansikte.",
      earMouth: (ear: number, mouth: number) =>
        `EAR (ögonöppning) ${ear.toFixed(3)}; munöppning ${mouth.toFixed(3)}.`,
      noSignal: "Ingen användbar visuell signal i senaste lokala provet.",
      boundary:
        "Detta är en mätmodell av rörelse/landmärken — inte känsla, smärta, avsikt eller diagnos. Vårdgivaren tolkar i rummet.",
      hintSettle:
        "Protokollhypotes: överväg space-first (gå tillbaka, pausa, sänk ljud/ljus) om personen visar tecken på belastning.",
      hintObserve:
        "Observation: notera om hand-mot-ansikte eller hög rörelse sammanfaller med ljud, krav eller övergång.",
      hintSteady: "Signalerna ser relativt stilla ut i detta fönster — jämför med vad du ser i rummet.",
      hintCaregiver: "Din observation i rummet har företräde framför kamerans tal.",
      hintRunCamera: "Kör NL-VISION en stund så att lokala signaler sparas, ställ sedan frågan igen.",
    };
  }
  if (lang === "es") {
    return {
      header: "Simulación científica de señales (NL-VISION, prototipo local):",
      faceYes: "Rostro: detectado en la ventana reciente.",
      faceNo: "Rostro: no detectado en la ventana reciente.",
      hands: (n: number) => `Manos visibles (promedio): ${n.toFixed(2)}.`,
      near: (pct: number, band: ScientificBand) =>
        `Mano cerca del rostro: ${pct}% del tiempo (banda: ${bandWord(band, "es")}).`,
      move: (f: number, h: number, band: ScientificBand) =>
        `Índice de movimiento — rostro ${f.toFixed(4)}, manos ${h.toFixed(4)} (banda: ${bandWord(band, "es")}).`,
      blink: (n: number, band: ScientificBand) =>
        `Parpadeos/min: ${n.toFixed(1)} (banda: ${bandWord(band, "es")}; comparación relativa, no norma clínica).`,
      blinkUnavailable: "Parpadeos: no disponibles sin rostro.",
      earMouth: (ear: number, mouth: number) =>
        `EAR (apertura ocular) ${ear.toFixed(3)}; apertura bucal ${mouth.toFixed(3)}.`,
      noSignal: "No hay señal visual usable en la muestra local reciente.",
      boundary:
        "Esto es un modelo de medición de movimiento/landmarks — no emoción, dolor, intención ni diagnóstico. La cuidadora interpreta en la habitación.",
      hintSettle:
        "Hipótesis de protocolo: considera space-first (alejarse, pausar, bajar sonido/luz) si ves carga en la persona.",
      hintObserve:
        "Observación: anota si mano-al-rostro o alto movimiento coincide con sonido, exigencia o transición.",
      hintSteady: "Las señales se ven relativamente quietas en esta ventana — compáralas con lo que ves en la habitación.",
      hintCaregiver: "Tu observación en la habitación tiene prioridad sobre lo que dice la cámara.",
      hintRunCamera: "Corre NL-VISION un rato para guardar señales locales, luego pregunta de nuevo.",
    };
  }
  return {
    header: "Scientific signal simulation (NL-VISION, local prototype):",
    faceYes: "Face: detected in the recent window.",
    faceNo: "Face: not detected in the recent window.",
    hands: (n: number) => `Hands visible (average): ${n.toFixed(2)}.`,
    near: (pct: number, band: ScientificBand) =>
      `Hand near face: ${pct}% of the time (band: ${bandWord(band, "en")}).`,
    move: (f: number, h: number, band: ScientificBand) =>
      `Movement index — face ${f.toFixed(4)}, hands ${h.toFixed(4)} (band: ${bandWord(band, "en")}).`,
    blink: (n: number, band: ScientificBand) =>
      `Blinks/min: ${n.toFixed(1)} (band: ${bandWord(band, "en")}; relative comparison, not a clinical norm).`,
    blinkUnavailable: "Blinks: unavailable without a face.",
    earMouth: (ear: number, mouth: number) =>
      `EAR (eye opening) ${ear.toFixed(3)}; mouth opening ${mouth.toFixed(3)}.`,
    noSignal: "No usable visual signal in the latest local sample.",
    boundary:
      "This is a measurement model of movement/landmarks — not emotion, pain, intent, or diagnosis. The caregiver interprets in the room.",
    hintSettle:
      "Protocol hypothesis: consider space-first (step back, pause, lower sound/light) if the person shows load in the room.",
    hintObserve:
      "Observation: note whether hand-to-face or high movement coincides with sound, demand, or transition.",
    hintSteady: "Signals look relatively quiet in this window — compare with what you see in the room.",
    hintCaregiver: "Your room observation has priority over what the camera reports.",
    hintRunCamera: "Run NL-VISION briefly so local signals are stored, then ask again.",
  };
}
