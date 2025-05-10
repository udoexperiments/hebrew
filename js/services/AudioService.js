// js/services/AudioService.js
import StateManager from '../managers/StateManager.js';

class AudioService {
  constructor() {
    this.context = null;
    this.buffers = {};
  }

  getAudioPaths(theme) {
    return {
      correct: `resources/audio/${theme}_correct.wav`,
      lap: `resources/audio/${theme}_lap.wav`,
      mistake: `resources/audio/${theme}_mistake.wav`,
    };
  }

  async initialize() {
    try {
      if (!this.context) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
      }

      this.buffers = {};
      const soundTheme = StateManager.get('soundTheme');
      const audioPaths = this.getAudioPaths(soundTheme);

      await Promise.all(
        Object.entries(audioPaths).map(async ([key, path]) => {
          try {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.buffers[key] = audioBuffer;
            console.log(`Loaded audio: ${key} (${soundTheme} theme)`);
          } catch (error) {
            console.error(`Error loading audio file ${path}:`, error);
          }
        })
      );

      StateManager.set('audioContext', this.context);
      StateManager.set('audioBuffers', this.buffers);
    } catch (error) {
      console.error("Audio initialization error:", error);
    }
  }

  play(type) {
    if (!this.context || !this.buffers[type]) {
      console.warn(`No audio buffer available for ${type}`);
      return;
    }

    const source = this.context.createBufferSource();
    source.buffer = this.buffers[type];
    source.connect(this.context.destination);
    source.start(0);
  }
}

export default new AudioService();