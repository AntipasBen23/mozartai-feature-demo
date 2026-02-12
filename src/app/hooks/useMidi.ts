// frontend/src/app/hooks/useMidi.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MidiStatus = "idle" | "connecting" | "connected" | "unsupported" | "denied" | "error";

export type MidiNoteEvent = {
  type: "noteon" | "noteoff";
  note: number; // 0-127
  velocity: number; // 0-127
  channel: number; // 0-15
  ts: number; // performance.now()
};

function isWebMidiSupported() {
  return typeof navigator !== "undefined" && typeof navigator.requestMIDIAccess === "function";
}

export function useMidi(maxEvents: number = 64) {
  const [status, setStatus] = useState<MidiStatus>("idle");
  const [inputName, setInputName] = useState<string | null>(null);
  const [events, setEvents] = useState<MidiNoteEvent[]>([]);
  const accessRef = useRef<MIDIAccess | null>(null);
  const inputRef = useRef<MIDIInput | null>(null);

  const supported = useMemo(() => isWebMidiSupported(), []);

  useEffect(() => {
    let disposed = false;

    async function connect() {
      if (!supported) {
        setStatus("unsupported");
        return;
      }

      setStatus("connecting");

      try {
        const access = await navigator.requestMIDIAccess?.({ sysex: false });
        if (!access || disposed) return;

        accessRef.current = access;

        const inputs = Array.from(access.inputs.values());
        const first = inputs[0] ?? null;

        if (!first) {
          setInputName("No MIDI devices found");
          setStatus("connected");
          return;
        }

        inputRef.current = first;
        setInputName(first.name ?? "MIDI Input");
        setStatus("connected");

        first.onmidimessage = (msg: MIDIMessageEvent) => {
          const data = msg.data;
          if (!data || data.length < 3) return;

          const statusByte = data[0];
          const command = statusByte & 0xf0;
          const channel = statusByte & 0x0f;
          const note = data[1];
          const velocity = data[2];

          const isNoteOn = command === 0x90 && velocity > 0;
          const isNoteOff = command === 0x80 || (command === 0x90 && velocity === 0);

          if (!isNoteOn && !isNoteOff) return;

          const ev: MidiNoteEvent = {
            type: isNoteOn ? "noteon" : "noteoff",
            note,
            velocity,
            channel,
            ts: performance.now(),
          };

          setEvents((prev) => [ev, ...prev].slice(0, maxEvents));
        };
      } catch (e: any) {
        if (disposed) return;

        const name = String(e?.name || "");
        if (name.includes("NotAllowed") || name.includes("Security")) setStatus("denied");
        else setStatus("error");
      }
    }

    connect();

    return () => {
      disposed = true;
      if (inputRef.current) inputRef.current.onmidimessage = null;
    };
  }, [supported, maxEvents]);

  function clear() {
    setEvents([]);
  }

  return { supported, status, inputName, events, clear };
}
