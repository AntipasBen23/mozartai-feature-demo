// frontend/src/app/types/webmidi.d.ts
// Minimal WebMIDI typings for this demo (enough to satisfy TS).

declare global {
  interface Navigator {
    requestMIDIAccess?: (options?: { sysex?: boolean }) => Promise<MIDIAccess>;
  }

  interface MIDIAccess extends EventTarget {
    inputs: Map<string, MIDIInput>;
    outputs: Map<string, MIDIOutput>;
    onstatechange: ((this: MIDIAccess, ev: Event) => any) | null;
  }

  interface MIDIInput extends EventTarget {
    id: string;
    name?: string;
    manufacturer?: string;
    onmidimessage: ((this: MIDIInput, ev: MIDIMessageEvent) => any) | null;
  }

  interface MIDIOutput extends EventTarget {
    id: string;
    name?: string;
    manufacturer?: string;
  }

  interface MIDIMessageEvent extends Event {
    data: Uint8Array;
  }
}

export {};
