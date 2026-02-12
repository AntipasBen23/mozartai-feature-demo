// frontend/src/app/hooks/useSynth.ts
"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type SynthStatus = "idle" | "ready" | "blocked" | "error";

type Voice = {
  osc: OscillatorNode;
  gain: GainNode;
};

function midiToFreq(note: number) {
  // A4 = 440Hz at MIDI note 69
  return 440 * Math.pow(2, (note - 69) / 12);
}

export function useSynth() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const voicesRef = useRef<Map<number, Voice>>(new Map());
  const [status, setStatus] = useState<SynthStatus>("idle");

  const supported = useMemo(() => typeof window !== "undefined" && !!(window.AudioContext || (window as any).webkitAudioContext), []);

  const ensureStarted = useCallback(async () => {
    if (!supported) {
      setStatus("error");
      return false;
    }

    try {
      if (!ctxRef.current) {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AC();
        const master = ctx.createGain();
        master.gain.value = 0.8;
        master.connect(ctx.destination);

        ctxRef.current = ctx;
        masterRef.current = master;
      }

      const ctx = ctxRef.current!;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      setStatus(ctx.state === "running" ? "ready" : "blocked");
      return ctx.state === "running";
    } catch {
      setStatus("error");
      return false;
    }
  }, [supported]);

  const noteOn = useCallback(
    async (note: number, velocity: number = 100) => {
      const ok = await ensureStarted();
      if (!ok) return;

      const ctx = ctxRef.current!;
      const master = masterRef.current!;
      const voices = voicesRef.current;

      // already playing this note
      if (voices.has(note)) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Simple synth tone (you can switch to "sawtooth" for trance later)
      osc.type = "sine";
      osc.frequency.value = midiToFreq(note);

      // Velocity -> amplitude (cap to avoid clipping)
      const amp = Math.min(1, Math.max(0.02, velocity / 127));
      const now = ctx.currentTime;

      // Envelope: quick attack, gentle decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(amp * 0.6, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(amp * 0.35, now + 0.12);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);

      voices.set(note, { osc, gain });
    },
    [ensureStarted]
  );

  const noteOff = useCallback((note: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const voices = voicesRef.current;
    const v = voices.get(note);
    if (!v) return;

    const now = ctx.currentTime;

    // Release envelope
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(Math.max(0.0001, v.gain.gain.value), now);
    v.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    // Stop oscillator after release
    try {
      v.osc.stop(now + 0.09);
    } catch {}

    voices.delete(note);
  }, []);

  const stopAll = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    for (const note of Array.from(voicesRef.current.keys())) {
      noteOff(note);
    }
  }, [noteOff]);

  return { supported, status, ensureStarted, noteOn, noteOff, stopAll };
}
