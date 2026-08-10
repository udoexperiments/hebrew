// js/ui/UI.js
import StateManager from '../managers/StateManager.js';
import ContentFormatter from './ContentFormatter.js';
import { FADE_DURATION, CATEGORIES } from '../config/constants.js';
import { ICONS } from './icons.js';

const REVEAL_PLACEHOLDER = `
  <div class="reveal-placeholder">
    ${ICONS.sparkles}
    <span>Reveal the translation</span>
  </div>`;

class UI {
  fadeElement(element, fadeIn = true) {
    element.style.transition = `opacity ${FADE_DURATION}ms ease`;
    if (fadeIn) {
      element.style.opacity = 0;
      setTimeout(() => (element.style.opacity = 1), 50);
    } else {
      element.style.opacity = 0;
    }
  }

  update() {
    const filteredData = StateManager.get('filteredData');
    const remainingIndices = StateManager.get('remainingIndices');
    const currentIndex = StateManager.get('currentIndex');
    
    if (filteredData.length === 0) return;

    const entry = filteredData[remainingIndices[currentIndex]];
    const englishText = document.getElementById("english-text");
    const hebrewContent = document.getElementById("hebrew-content");

    if (!englishText || !hebrewContent) return;

    this.fadeElement(englishText, false);
    this.fadeElement(hebrewContent, false);

    setTimeout(() => {
      if (StateManager.get('isEnglishToHebrew')) {
        // English to Hebrew mode - show button on English card
        if (StateManager.get('currentCategory') === 'grammar' && entry.english_example) {
          englishText.innerHTML = `
            <div class="grammar-english">
              <div class="main-text">${entry.english}</div>
              <div class="example-text" style="display: none;">${entry.english_example}</div>
            </div>
            <button class="example-toggle" onclick="window.toggleExample(this)">Show Example</button>`;
        } else {
          englishText.innerText = entry.english;
        }
        hebrewContent.innerHTML = REVEAL_PLACEHOLDER;
      } else {
        // Hebrew to English mode - show button on Hebrew card
        englishText.innerHTML = REVEAL_PLACEHOLDER;
        let hebrewHtml = ContentFormatter.formatHebrewContent(entry);
        
        // Add toggle button to Hebrew card if examples exist and we're in grammar category
        if (StateManager.get('currentCategory') === 'grammar' && 
            (entry.english_example || entry.hebrew_spoken_example || entry.hebrew_letters_example)) {
          hebrewHtml += '<button class="example-toggle" onclick="window.toggleExample(this)">Show Example</button>';
        }
        
        hebrewContent.innerHTML = hebrewHtml;
      }

      this.fadeElement(englishText, true);
      this.fadeElement(hebrewContent, true);
      this.updateProgress();
    }, FADE_DURATION);

    this.updateContextLabel();
  }

  // "What am I practicing" strip above the cards, e.g. "DAY OF THE WEEK"
  updateContextLabel() {
    const label = document.getElementById('context-label');
    if (!label) return;

    const category = StateManager.get('currentCategory');
    const categoryText = (CATEGORIES.find((c) => c.value === category) || {}).text || category;

    if (StateManager.get('allLessons')) {
      label.textContent = `${categoryText} · All Lessons`;
      return;
    }

    const currentLesson = StateManager.get('currentLesson');
    const data = StateManager.get('data');
    const lessonItem = data.find((item) => {
      const num = typeof item.lesson === 'number'
        ? item.lesson
        : parseInt(String(item.lesson).replace('Lesson ', '').trim(), 10);
      return num === currentLesson;
    });

    label.textContent = (lessonItem && lessonItem.word_type)
      ? lessonItem.word_type
      : `${categoryText} · Lesson ${currentLesson}`;
  }

  updateProgress() {
    const progressElement = document.getElementById("progress-display");
    const completedItems = StateManager.get('completedItems');
    const currentChunkIndices = StateManager.get('currentChunkIndices');
    
    if (progressElement) {
      const totalItems = currentChunkIndices.length || 10; // Default to 10 if not set
      const percentage = (completedItems / totalItems) * 100;
      
      // Find existing progress container
      let progressContainer = progressElement.querySelector('.progress-container');
      
      if (progressContainer) {
        // Update existing progress bar
        const progressFill = progressContainer.querySelector('.progress-fill');
        const progressText = progressContainer.querySelector('.progress-text');
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${completedItems}/${totalItems}`;
      }
    }
  }

  updateColorTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.setAttribute('data-theme', themeName);
    // Keep the iOS status bar / browser chrome in sync with the theme background
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = getComputedStyle(document.documentElement)
        .getPropertyValue('--background-color').trim();
    }
  }

  toggleFeedbackButtons(show) {
    const feedbackButtons = document.getElementById("feedback-buttons");
    const showButton = document.getElementById("show-continue");

    if (feedbackButtons && showButton) {
      feedbackButtons.style.display = show ? "flex" : "none";
      showButton.style.display = show ? "none" : "flex";
      StateManager.set('showingFeedback', show);
    }
  }

  showHebrew() {
    const hebrewContent = document.getElementById("hebrew-content");
    if (!hebrewContent) return;

    const filteredData = StateManager.get('filteredData');
    const remainingIndices = StateManager.get('remainingIndices');
    const currentIndex = StateManager.get('currentIndex');
    const entry = filteredData[remainingIndices[currentIndex]];
    
    const content = ContentFormatter.formatHebrewContent(entry);
    
    this.fadeElement(hebrewContent, false);
    setTimeout(() => {
      hebrewContent.innerHTML = content;
      this.fadeElement(hebrewContent, true);
    }, FADE_DURATION);
  }

  showEnglish() {
    const englishText = document.getElementById("english-text");
    if (!englishText) return;

    const filteredData = StateManager.get('filteredData');
    const remainingIndices = StateManager.get('remainingIndices');
    const currentIndex = StateManager.get('currentIndex');
    const entry = filteredData[remainingIndices[currentIndex]];
    
    this.fadeElement(englishText, false);
    setTimeout(() => {
      // For grammar category with examples, format the English display
      if (StateManager.get('currentCategory') === 'grammar' && entry.english_example) {
        englishText.innerHTML = `
          <div class="grammar-english">
            <div class="main-text">${entry.english}</div>
            <div class="example-text" style="display: none;">${entry.english_example}</div>
          </div>`;
        // Don't add button here - it's only on the card that's always visible
      } else {
        englishText.innerText = entry.english;
      }
      this.fadeElement(englishText, true);
    }, FADE_DURATION);
  }
}

export default new UI();