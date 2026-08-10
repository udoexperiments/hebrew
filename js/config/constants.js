// js/config/constants.js
export const FADE_DURATION = 100;
export const DEFAULT_CHUNK_SIZE = 10;

export const CATEGORIES = [
  { value: "basics", text: "Basics" }, // Moved basics to the top
  { value: "sentences_present", text: "Sentences (Present Tense)" },
  { value: "sentences_past", text: "Sentences (Past Tense)" },
  { value: "sentences_future", text: "Sentences (Future Tense)" },
  { value: "verbs", text: "Verbs" },
  { value: "nouns", text: "Nouns" },
  { value: "adjectives", text: "Adjectives" },
  { value: "grammar", text: "Grammar" },
];

export const SOUND_THEMES = [
  { value: "adjacent", text: "Adjacent" },
  { value: "cone", text: "Cone" },
  { value: "spline", text: "Spline" },
  { value: "vector", text: "Vector" },
];

export const COLOR_THEMES = [
  { value: "pastel", text: "Pastel" },
  { value: "sage", text: "Sage" },
  { value: "rose-eucalyptus", text: "Rose & Eucalyptus" },
  { value: "nocturne", text: "Nocturne (Dark)" },
];

export const CHUNK_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: (i + 1) * 10,
  text: `${(i + 1) * 10} words`,
}));