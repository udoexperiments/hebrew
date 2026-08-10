// js/handlers/EventHandlers.js - User actions
import StateManager from '../managers/StateManager.js';
import ChunkManager from '../managers/ChunkManager.js';
import DataService from '../services/DataService.js';
import AudioService from '../services/AudioService.js';
import UI from '../ui/UI.js';

class EventHandlers {
  handleCorrect() {
    const result = ChunkManager.handleItemComplete(true);

    // Update progress immediately after a correct answer
    UI.updateProgress();

    // Add subtle haptic feedback for correct answers
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (result === 'chunk_complete') {
      AudioService.play('lap');

      // Stronger haptic feedback for chunk completion
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      StateManager.set('isRevealed', false);
      UI.toggleFeedbackButtons(false);

      // Let the full progress bar sit for a moment before starting the next round
      setTimeout(() => {
        ChunkManager.initializeNewChunk();
        UI.update();
      }, 1000);
    } else {
      AudioService.play('correct');
      StateManager.set('isRevealed', false);
      UI.toggleFeedbackButtons(false);
      UI.update();
    }
  }

  handleMistake() {
    AudioService.play('mistake');
    ChunkManager.handleItemComplete(false);

    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.classList.add('mistake-flash');
      setTimeout(() => {
        progressFill.classList.remove('mistake-flash');
      }, 500);
    }

    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    StateManager.set('isRevealed', false);
    UI.toggleFeedbackButtons(false);
    UI.update();
  }

  reveal() {
    if (StateManager.get('isRevealed')) return;
    if (StateManager.get('isEnglishToHebrew')) {
      UI.showHebrew();
    } else {
      UI.showEnglish();
    }
    StateManager.set('isRevealed', true);
    UI.toggleFeedbackButtons(true);
  }

  toggleDirection() {
    StateManager.set('isEnglishToHebrew', !StateManager.get('isEnglishToHebrew'));
    StateManager.set('isRevealed', false);
    UI.toggleFeedbackButtons(false);
    UI.update();
    this.refreshMenu();
  }

  async setCategory(value) {
    StateManager.update({
      currentCategory: value,
      allLessons: true,
      currentLesson: 0,
      isRevealed: false,
    });
    await DataService.load(value);
    DataService.filterByLesson();
    ChunkManager.initializeRandomization();
    UI.toggleFeedbackButtons(false);
    UI.update();
    UI.updateProgress();
    this.refreshMenu();
  }

  setLesson(lesson) {
    if (lesson === 'all') {
      StateManager.update({ allLessons: true, currentLesson: 0 });
    } else {
      StateManager.update({ allLessons: false, currentLesson: lesson });
    }
    StateManager.set('isRevealed', false);
    DataService.filterByLesson();
    ChunkManager.initializeRandomization();
    UI.toggleFeedbackButtons(false);
    UI.update();
    UI.updateProgress();
    this.refreshMenu();
  }

  setChunkSize(value) {
    StateManager.set('chunkSize', Number.parseInt(value, 10));
    StateManager.set('isRevealed', false);
    DataService.filterByLesson();
    ChunkManager.initializeRandomization();
    UI.toggleFeedbackButtons(false);
    UI.update();
    UI.updateProgress();
    this.refreshMenu();
  }

  async setSoundTheme(value) {
    StateManager.set('soundTheme', value);
    await AudioService.initialize();
    this.refreshMenu();
  }

  setColorTheme(value) {
    StateManager.set('colorTheme', value);
    UI.updateColorTheme(value);
    this.refreshMenu();
  }

  // Lazy import avoids a circular dependency (MenuSystem imports EventHandlers)
  refreshMenu() {
    import('../ui/MenuSystem.js').then(({ default: MenuSystem }) => MenuSystem.refresh());
  }
}

export default new EventHandlers();
