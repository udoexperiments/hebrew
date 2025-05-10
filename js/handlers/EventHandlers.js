// js/handlers/EventHandlers.js
import StateManager from '../managers/StateManager.js';
import ChunkManager from '../managers/ChunkManager.js';
import AudioService from '../services/AudioService.js';
import UI from '../ui/UI.js';

class EventHandlers {
  handleCorrect() {
    const result = ChunkManager.handleItemComplete(true);
    
    // Update progress immediately after a correct answer
    UI.updateProgress();
    
    // Add subtle haptic feedback for correct answers
    if (navigator.vibrate) {
      navigator.vibrate(50); // Short 50ms vibration
    }
    
    // Play appropriate sound based on result
    if (result === 'chunk_complete') {
      AudioService.play('lap');
      
      // Stronger haptic feedback for chunk completion
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // Pattern: vibrate 100ms, pause 50ms, vibrate 100ms
      }
      
      // Show next card immediately
      StateManager.set('isRevealed', false);
      UI.toggleFeedbackButtons(false);
      
      // Initialize new chunk but keep the current progress display for a moment
      setTimeout(() => {
        // Only reset the progress bar after a delay
        UI.updateProgress();
      }, 1000);
      
      // Initialize new chunk and update UI immediately
      ChunkManager.initializeNewChunk();
      UI.update();
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
    
    // Flash the progress bar red
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.classList.add('mistake-flash');
      setTimeout(() => {
        progressFill.classList.remove('mistake-flash');
      }, 500);
    }
    
    // Add haptic feedback for mistakes
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]); // Pattern: vibrate 50ms, pause 30ms, vibrate 50ms
    }
    
    StateManager.set('isRevealed', false);
    UI.toggleFeedbackButtons(false);
    UI.update();
  }

  handleDirectionToggle() {
    const isEnglishToHebrew = !StateManager.get('isEnglishToHebrew');
    StateManager.set('isEnglishToHebrew', isEnglishToHebrew);
    
    const directionButton = document.getElementById("switch-direction");
    if (directionButton) {
      directionButton.querySelector(".button-text").innerText = 
        isEnglishToHebrew ? "English → Hebrew" : "Hebrew → English";
    }
    
    UI.update();
  }

  handleShowContent() {
    if (!StateManager.get('isRevealed')) {
      const isEnglishToHebrew = StateManager.get('isEnglishToHebrew');
      UI.showContent(!isEnglishToHebrew);
      StateManager.set('isRevealed', true);
      UI.toggleFeedbackButtons(true);
    }
  }
}

export default new EventHandlers();