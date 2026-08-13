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

  // Topic (word_type) of a lesson within a dataset, or null when unnamed/absent
  lessonTopic(data, lessonNumber) {
    const item = data.find((entry) => {
      const num = typeof entry.lesson === 'number'
        ? entry.lesson
        : parseInt(String(entry.lesson).replace('Lesson ', '').trim(), 10);
      return num === lessonNumber;
    });
    return item ? { exists: true, topic: item.word_type || null } : { exists: false, topic: null };
  }

  async setCategory(value) {
    const previousCategory = StateManager.get('currentCategory');
    const previousLesson = StateManager.get('currentLesson');
    const hadLesson = !StateManager.get('allLessons') && previousLesson > 0;
    const previousTopic = hadLesson
      ? this.lessonTopic(StateManager.get('data'), previousLesson).topic
      : null;

    StateManager.update({ currentCategory: value, isRevealed: false });
    await DataService.load(value);

    // Keep the lesson when the new category has "the same" lesson:
    // same number with the same topic name, or same number within the same
    // category family (sentences_present/past/future) when lessons are unnamed.
    let keepLesson = false;
    if (hadLesson) {
      const next = this.lessonTopic(StateManager.get('data'), previousLesson);
      if (next.exists) {
        const sameFamily = previousCategory.split('_')[0] === value.split('_')[0];
        keepLesson = (previousTopic || next.topic)
          ? previousTopic === next.topic
          : sameFamily;
      }
    }
    StateManager.update(keepLesson
      ? { allLessons: false, currentLesson: previousLesson }
      : { allLessons: true, currentLesson: 0 });

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
