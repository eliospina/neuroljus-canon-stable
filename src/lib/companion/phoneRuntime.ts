/**
 * Companion — browser-only effects for the phone body.
 *
 * Brown noise is generated with Web Audio (no audio files), gain is capped by
 * phoneBody.MAX_NOISE_GAIN and every change is smoothed so there are no
 * sudden sounds. Wake Lock keeps the screen on while a routine runs.
 */

import { MAX_NOISE_GAIN } from "./phoneBody";

type AudioCtor = typeof AudioContext;

function audioContextCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/** Seconds for gain changes to settle (time constant ≈ a third of this). */
const SMOOTH_SECONDS = 3;

export class BrownNoise {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private source: AudioBufferSourceNode | null = null;

  /** Must be called from a user gesture (Start button) so iOS allows audio. */
  start(): boolean {
    if (this.ctx) return true;
    const Ctor = audioContextCtor();
    if (!Ctor) return false;
    try {
      const ctx = new Ctor();
      const seconds = 4;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      void ctx.resume?.();
      this.ctx = ctx;
      this.gain = gain;
      this.source = source;
      return true;
    } catch {
      return false;
    }
  }

  setGain(value: number): void {
    if (!this.ctx || !this.gain) return;
    const target = Math.min(MAX_NOISE_GAIN, Math.max(0, value));
    this.gain.gain.setTargetAtTime(target, this.ctx.currentTime, SMOOTH_SECONDS / 3);
  }

  /** Fade out softly, then release the audio device. */
  stop(): void {
    const ctx = this.ctx;
    const source = this.source;
    if (!ctx) return;
    this.setGain(0);
    this.ctx = null;
    this.gain = null;
    this.source = null;
    window.setTimeout(() => {
      try {
        source?.stop();
        void ctx.close();
      } catch {
        /* already closed */
      }
    }, SMOOTH_SECONDS * 1000);
  }
}

type WakeLockSentinelLike = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
};

export async function requestWakeLock(): Promise<WakeLockSentinelLike | null> {
  try {
    const nav = navigator as WakeLockNavigator;
    return nav.wakeLock ? await nav.wakeLock.request("screen") : null;
  } catch {
    return null;
  }
}

/** A short, gentle vibration where supported (not on iOS Safari). */
export function softVibrate(): void {
  try {
    navigator.vibrate?.([60, 120, 60]);
  } catch {
    /* unsupported */
  }
}
