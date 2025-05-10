// js/managers/StateManager.js
import { DEFAULT_CHUNK_SIZE } from '../config/constants.js';

class StateManager {
  constructor() {
    this.state = {
      currentCategory: "basics", // Changed to start with basics
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
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
  }

  update(updates) {
    Object.assign(this.state, updates);
  }

  getState() {
    return { ...this.state };
  }
}

export default new StateManager();