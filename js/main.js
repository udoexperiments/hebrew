// js/main.js - App bootstrap and event wiring
import StateManager from './managers/StateManager.js';
import AudioService from './services/AudioService.js';
import DataService from './services/DataService.js';
import ChunkManager from './managers/ChunkManager.js';
import UI from './ui/UI.js';
import MenuSystem from './ui/MenuSystem.js';
import EventHandlers from './handlers/EventHandlers.js';

class App {
  static async initialize() {
    // Set initial theme
    UI.updateColorTheme(StateManager.get('colorTheme'));

    // Load data and audio concurrently; the menu's lesson list needs the data
    const currentCategory = StateManager.get('currentCategory');
    await Promise.all([
      AudioService.initialize(),
      DataService.load(currentCategory),
    ]);
    DataService.filterByLesson();
    // Resume the saved round if it still matches the restored selection
    if (!StateManager.restoreChunkProgress()) {
      ChunkManager.initializeRandomization();
    }

    // Build UI
    MenuSystem.init();
    App.setupEventListeners();
    UI.update();
    UI.updateProgress();
  }

  static setupEventListeners() {
    const on = (id, handler) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', handler);
    };

    on('menu-button', () => MenuSystem.toggle());
    on('home-button', () => MenuSystem.toggle());
    on('show-continue', () => EventHandlers.reveal());
    on('swap-direction', () => EventHandlers.toggleDirection());
    on('chunk-peek', () => UI.openChunkOverlay());
    on('overlay-close', () => UI.closeChunkOverlay());

    App.setupSwipeNavigation();

    // Tapping the hidden card also reveals the answer (bigger target than the button)
    ['english-section', 'hebrew-section'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          if (e.target.closest('.example-toggle')) return;
          EventHandlers.reveal();
        });
      }
    });

    const feedbackButtons = document.getElementById('feedback-buttons');
    if (feedbackButtons) {
      feedbackButtons.querySelector('.correct').addEventListener('click', () => EventHandlers.handleCorrect());
      feedbackButtons.querySelector('.mistake').addEventListener('click', () => EventHandlers.handleMistake());
    }

    // Global function for toggling grammar examples (assigned below)
    App.registerExampleToggle();
  }

  // Swipe right opens the menu, swipe left closes it (mirrors the slide transition)
  static setupSwipeNavigation() {
    const slider = document.getElementById('page-slider');
    if (!slider) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    slider.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      if (!tracking) return;
      tracking = false;

      const overlay = document.getElementById('chunk-overlay');
      if (overlay && !overlay.classList.contains('hidden')) return;

      const deltaX = e.changedTouches[0].clientX - startX;
      const deltaY = e.changedTouches[0].clientY - startY;
      if (Math.abs(deltaX) < 60 || Math.abs(deltaY) > 50) return;

      const isMenuOpen = StateManager.get('isMenuOpen');
      if (deltaX > 0 && !isMenuOpen) MenuSystem.toggle();
      if (deltaX < 0 && isMenuOpen) MenuSystem.toggle();
    }, { passive: true });
  }

  static registerExampleToggle() {
    // Global function for toggling grammar examples
    window.toggleExample = function (button) {
      const allToggles = document.querySelectorAll('.example-toggle');
      const isShowing = button.textContent === 'Show Example';

      const englishExample = document.querySelector('#english-section .example-text');
      if (englishExample) {
        englishExample.style.display = isShowing ? 'block' : 'none';
      }

      const hebrewExample = document.querySelector('#hebrew-section .example-section');
      if (hebrewExample) {
        hebrewExample.style.display = isShowing ? 'block' : 'none';
      }

      allToggles.forEach((toggleBtn) => {
        toggleBtn.textContent = isShowing ? 'Hide Example' : 'Show Example';
      });
    };
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => App.initialize());
