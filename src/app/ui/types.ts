// frontend/src/app/ui/types.ts

export type Genre = "Jazz" | "Trance" | "Classical";

export type Clip = {
  id: string;
  name: string;
  startBar: number; // 1-based
  bars: number;
  variant?: "A" | "B";
};

export type TrackKind = "Piano" | "Bass" | "Drums" | "Pads";

export type Track = {
  id: string;
  name: string;
  kind: TrackKind;
  muted?: boolean;
  solo?: boolean;
  clips: Clip[];
};

export type Project = {
  id: string;
  name: string;
  genre: Genre;
  key: string;
  bpm: number;
  updated: string;
};

export const BAR_COUNT = 16;
