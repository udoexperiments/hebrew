// js/main.js
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
    const colorTheme = StateManager.get('colorTheme');
    document.documentElement.setAttribute('data-theme', colorTheme);
    document.body.setAttribute('data-theme', colorTheme);
    
    // Initialize services
    await AudioService.initialize();
    
    // Create UI components
    MenuSystem.create();
    App.setupEventListeners();
    App.createDynamicElements();
    
    // Load initial data
    const currentCategory = StateManager.get('currentCategory');
    await DataService.load(currentCategory);
    DataService.filterByLesson();
    ChunkManager.initializeRandomization();
    UI.update();
    
    // Initialize progress bar display
    UI.updateProgress();
    
    // Update lesson button labels after data is loaded
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      MenuSystem.updateLessonButtonLabels();
    }, 100);
  }

  static setupEventListeners() {
    // Menu button
    const menuButton = document.getElementById("menu-button");
    if (menuButton) {
      menuButton.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Menu button clicked");
        MenuSystem.toggle();
      });
    } else {
      console.error("Menu button not found");
    }

    // Direction button
    const directionButton = document.getElementById("switch-direction");
    if (directionButton) {
      directionButton.addEventListener("click", () => {
        const isEnglishToHebrew = !StateManager.get('isEnglishToHebrew');
        StateManager.set('isEnglishToHebrew', isEnglishToHebrew);
        directionButton.querySelector(".button-text").innerText = 
          isEnglishToHebrew ? "English → Hebrew" : "Hebrew → English";
        UI.update();
      });
    }

    // Show button
    const showButton = document.getElementById("show-continue");
    if (showButton) {
      showButton.addEventListener("click", () => {
        const isRevealed = StateManager.get('isRevealed');
        if (!isRevealed) {
          const isEnglishToHebrew = StateManager.get('isEnglishToHebrew');
          
          // Show the hidden language content
          if (isEnglishToHebrew) {
            UI.showHebrew();
          } else {
            UI.showEnglish();
          }
          
          StateManager.set('isRevealed', true);
          UI.toggleFeedbackButtons(true);
        }
      });
    }
    
    // Add global function for toggling examples
    window.toggleExample = function(button) {
      // Find all example toggles on the page
      const allToggles = document.querySelectorAll('.example-toggle');
      
      // Get the current state from the clicked button
      const isShowing = button.textContent === 'Show Example';
      
      // Update both English and Hebrew examples
      const englishCard = document.getElementById('english-section');
      const hebrewCard = document.getElementById('hebrew-section');
      
      if (englishCard) {
        const englishExample = englishCard.querySelector('.example-text');
        if (englishExample) {
          englishExample.style.display = isShowing ? 'block' : 'none';
        }
      }
      
      if (hebrewCard) {
        const hebrewExample = hebrewCard.querySelector('.example-section');
        if (hebrewExample) {
          hebrewExample.style.display = isShowing ? 'block' : 'none';
        }
      }
      
      // Update all toggle buttons to have the same text
      allToggles.forEach(toggleBtn => {
        toggleBtn.textContent = isShowing ? 'Hide Example' : 'Show Example';
      });
    };
  }

  static createDynamicElements() {
    // Progress display
    const footer = document.querySelector("footer");
    if (footer) {
      const progressDisplay = document.createElement("div");
      progressDisplay.id = "progress-display";
      progressDisplay.style.textAlign = "center";
      progressDisplay.style.marginTop = "8px";
      progressDisplay.style.color = "#333";
      footer.appendChild(progressDisplay);
      
      // Create progress bar immediately
      this.createProgressBar(progressDisplay);
    }

    // Feedback buttons
    App.createFeedbackButtons();
  }

  static createProgressBar(progressElement) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = '0%'; // Start at 0%
    
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);
    
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.textContent = '0/10'; // Show 0/10 initially
    progressContainer.appendChild(progressText);
    
    progressElement.appendChild(progressContainer);
  }

  static createFeedbackButtons() {
    const footer = document.querySelector("footer");
    const container = document.createElement("div");
    container.id = "feedback-buttons";
    container.style.display = "none";
    container.className = "feedback-container";

    const correctButton = document.createElement("button");
    correctButton.className = "direction-button feedback-button correct";
    correctButton.innerHTML = '<span class="button-text">Correct</span>';
    correctButton.onclick = () => EventHandlers.handleCorrect();

    const mistakeButton = document.createElement("button");
    mistakeButton.className = "direction-button feedback-button mistake";
    mistakeButton.innerHTML = '<span class="button-text">Mistake</span>';
    mistakeButton.onclick = () => EventHandlers.handleMistake();

    container.appendChild(correctButton);
    container.appendChild(mistakeButton);
    footer.insertBefore(container, document.getElementById("show-continue"));
  }
}

// Start the application
document.addEventListener("DOMContentLoaded", () => App.initialize());