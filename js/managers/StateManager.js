// js/managers/StateManager.js
import { DEFAULT_CHUNK_SIZE } from '../config/constants.js';

const STORAGE_KEY = 'speech-explorer-state-v1';

// Persisted user preferences
const SETTINGS_KEYS = [
  'currentCategory',
  'chunkSize',
  'isEnglishToHebrew',
  'currentLesson',
  'allLessons',
  'soundTheme',
  'colorTheme',
];

// Persisted practice progress (restored only when the selection still matches)
const PROGRESS_KEYS = [
  'masterIndices',
  'completedChunkIndices',
  'currentChunkIndices',
  'remainingIndices',
  'currentIndex',
  'completedItems',
];

class StateManager {
  constructor() {
    this.state = {
      currentCategory: "basics",
      chunkSize: DEFAULT_CHUNK_SIZE,
      data: [],
      filteredData: [],
      currentIndex: 0,
      isRevealed: false,
      isEnglishToHebrew: true,
      randomizedIndices: [],
      completedItems: 0,
      remainingIndices: [],
      showingFeedback: false,
      audioContext: null,
      audioBuffers: {},
      currentChunkIndices: [],
      completedChunkIndices: new Set(),
      masterIndices: [],
      isMenuOpen: false,
      currentLesson: 1,
      soundTheme: "adjacent",
      allLessons: false,
      colorTheme: "pastel",
    };
    this._storedProgress = null;
    this._saveTimer = null;
    this.hydrate();
  }

  hydrate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (stored.settings) {
        SETTINGS_KEYS.forEach((key) => {
          if (stored.settings[key] !== undefined) this.state[key] = stored.settings[key];
        });
      }
      this._storedProgress = stored.progress || null;
    } catch (error) {
      console.warn('Could not restore saved state:', error);
    }
  }

  selectionKey() {
    const lesson = this.state.allLessons ? 'all' : this.state.currentLesson;
    return `${this.state.currentCategory}|${lesson}|${this.state.chunkSize}`;
  }

  // Apply saved chunk progress if it belongs to the current selection.
  // Returns true when restored (caller can skip fresh randomization).
  restoreChunkProgress() {
    const p = this._storedProgress;
    this._storedProgress = null;
    if (!p || p.key !== this.selectionKey()) return false;
    if (!Array.isArray(p.masterIndices) || p.masterIndices.length !== this.state.filteredData.length) return false;
    if (!Array.isArray(p.remainingIndices) || p.remainingIndices.length === 0) return false;
    Object.assign(this.state, {
      masterIndices: p.masterIndices,
      completedChunkIndices: new Set(p.completedChunkIndices || []),
      currentChunkIndices: p.currentChunkIndices || [],
      remainingIndices: p.remainingIndices,
      currentIndex: Math.min(p.currentIndex || 0, p.remainingIndices.length - 1),
      completedItems: p.completedItems || 0,
    });
    return true;
  }

  persistSoon() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.persist(), 100);
  }

  persist() {
    try {
      const settings = {};
      SETTINGS_KEYS.forEach((key) => (settings[key] = this.state[key]));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        settings,
        progress: {
          key: this.selectionKey(),
          masterIndices: this.state.masterIndices,
          completedChunkIndices: [...this.state.completedChunkIndices],
          currentChunkIndices: this.state.currentChunkIndices,
          remainingIndices: this.state.remainingIndices,
          currentIndex: this.state.currentIndex,
          completedItems: this.state.completedItems,
        },
      }));
    } catch (error) {
      console.warn('Could not save state:', error);
    }
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    if (SETTINGS_KEYS.includes(key) || PROGRESS_KEYS.includes(key)) this.persistSoon();
  }

  update(updates) {
    Object.assign(this.state, updates);
    const keys = Object.keys(updates);
    if (keys.some((key) => SETTINGS_KEYS.includes(key) || PROGRESS_KEYS.includes(key))) this.persistSoon();
  }

  getState() {
    return { ...this.state };
  }
}

export default new StateManager();
