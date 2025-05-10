// js/ui/MenuSystem.js
import StateManager from '../managers/StateManager.js';
import DataService from '../services/DataService.js';
import ChunkManager from '../managers/ChunkManager.js';
import AudioService from '../services/AudioService.js';
import UI from './UI.js';
import { CATEGORIES, SOUND_THEMES, COLOR_THEMES } from '../config/constants.js';

class MenuSystem {
  create() {
    const menuGrid = document.getElementById("menu-grid");
    if (!menuGrid) {
      console.error("Menu grid element not found");
      return;
    }
    
    // Only create if empty or force recreation
    if (menuGrid.children.length > 0) return;
    
    console.log("Creating menu...");

    // Category select
    this.createControlSection(menuGrid, "Category:", CATEGORIES, 
      StateManager.get('currentCategory'), async (value) => {
        StateManager.set('currentCategory', value);
        await DataService.load(value);
        DataService.filterByLesson();
        ChunkManager.initializeRandomization();
        UI.update();
        
        // Update lesson button labels after loading data
        // Add a small timeout to ensure the DOM is updated
        setTimeout(() => {
          this.updateLessonButtonLabels();
        }, 50);
      });

    // Chunk size select
    const chunkOptions = Array.from({ length: 10 }, (_, i) => ({
      value: (i + 1) * 10,
      text: `${(i + 1) * 10} words`
    }));
    
    this.createControlSection(menuGrid, "Chunk Size:", chunkOptions, 
      StateManager.get('chunkSize'), (value) => {
        StateManager.set('chunkSize', Number.parseInt(value));
        DataService.filterByLesson();
        ChunkManager.initializeRandomization();
        UI.update();
        UI.updateProgress(); // Add progress update
      });

    // Lesson buttons
    this.createLessonButtons(menuGrid);

    // Sound theme select
    this.createControlSection(menuGrid, "Sound Theme:", SOUND_THEMES, 
      StateManager.get('soundTheme'), async (value) => {
        StateManager.set('soundTheme', value);
        await AudioService.initialize();
      });

    // Color theme select
    this.createControlSection(menuGrid, "Color Theme:", COLOR_THEMES, 
      StateManager.get('colorTheme'), (value) => {
        StateManager.set('colorTheme', value);
        UI.updateColorTheme(value);
      });

    // Update lesson button labels immediately after creation
    // This will work for any category that has word_type entries
    setTimeout(() => {
      this.updateLessonButtonLabels();
    }, 50);
  }

  createControlSection(parent, label, options, currentValue, onChange) {
    const container = document.createElement("div");
    container.className = "menu-control-container";

    const labelElement = document.createElement("div");
    labelElement.className = "menu-label";
    labelElement.textContent = label;

    const select = document.createElement("select");
    select.className = "glass-select menu-select";

    options.forEach(option => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.text = option.text;
      if (option.value === currentValue) optionElement.selected = true;
      select.appendChild(optionElement);
    });

    select.addEventListener("change", e => onChange(e.target.value));

    container.appendChild(labelElement);
    container.appendChild(select);
    parent.appendChild(container);
  }

  createLessonButtons(parent) {
    const container = document.createElement("div");
    container.className = "lesson-container";
    container.style.gridColumn = "span 2";

    const label = document.createElement("div");
    label.className = "menu-label";
    label.textContent = "Lesson:";
    container.appendChild(label);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "lesson-buttons-container";

    // All Lessons button
    const allLessonsButton = this.createLessonButton("All Lessons", "lesson-all", () => {
      StateManager.update({
        allLessons: true,
        currentLesson: 0
      });
      DataService.filterByLesson();
      ChunkManager.initializeRandomization();
      UI.update();
    }, StateManager.get('allLessons'));

    // Add full-width class to All Lessons button
    allLessonsButton.classList.add("full-width-button");

    buttonsContainer.appendChild(allLessonsButton);

    // Individual lesson buttons
    for (let i = 1; i <= 12; i++) {
      const button = this.createLessonButton(`Lesson ${i}`, `lesson-${i}`, () => {
        StateManager.update({
          allLessons: false,
          currentLesson: i
        });
        DataService.filterByLesson();
        ChunkManager.initializeRandomization();
        UI.update();
      }, !StateManager.get('allLessons') && StateManager.get('currentLesson') === i);

      buttonsContainer.appendChild(button);
    }

    container.appendChild(buttonsContainer);
    parent.appendChild(container);
  }

  createLessonButton(text, id, onClick, isActive) {
    const button = document.createElement("button");
    button.className = `menu-item ${isActive ? "active-lesson" : ""}`;
    button.id = id;
    button.innerHTML = `<span class="button-text">${text}</span>`;
    
    button.onclick = () => {
      document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active-lesson");
      });
      button.classList.add("active-lesson");
      onClick();
    };

    return button;
  }

  toggle() {
    const isMenuOpen = !StateManager.get('isMenuOpen');
    StateManager.set('isMenuOpen', isMenuOpen);

    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const categoryGroup = document.querySelector(".control-group:not(:first-child)");
    const menuGrid = document.getElementById("menu-grid");
    const directionButton = document.getElementById("switch-direction");

    if (isMenuOpen) {
      // Hide main app elements
      if (main) main.classList.add("hidden");
      if (footer) footer.classList.add("hidden");
      if (categoryGroup) categoryGroup.classList.add("hidden");
      if (directionButton) directionButton.style.display = "none";
      
      // Show menu grid
      if (menuGrid) {
        menuGrid.classList.add("visible");
        menuGrid.style.display = "grid";
        
        // If menu is empty, create it
        if (menuGrid.children.length === 0) {
          this.create();
        }
        
        // Update lesson button labels when opening the menu
        // Small timeout to ensure DOM is ready
        setTimeout(() => {
          this.updateLessonButtonLabels();
        }, 50);
      }
    } else {
      // Show main app elements
      if (main) main.classList.remove("hidden");
      if (footer) footer.classList.remove("hidden");
      if (categoryGroup) categoryGroup.classList.remove("hidden");
      if (directionButton) directionButton.style.display = "block";
      
      // Hide menu grid
      if (menuGrid) {
        menuGrid.classList.remove("visible");
        menuGrid.style.display = "none";
      }
    }

    const menuButton = document.getElementById("menu-button");
    if (menuButton) {
      menuButton.querySelector(".button-text").innerText = isMenuOpen ? "Show App" : "Menu";
    }
  }

  updateLessonButtonLabels() {
    const currentCategory = StateManager.get('currentCategory');
    const data = StateManager.get('data');
    
    console.log('Updating lesson labels, category:', currentCategory, 'data length:', data.length);
    
    // Get all lesson buttons
    const lessonButtons = document.querySelectorAll('.menu-item');
    
    if (data.length > 0) {
      // Check if any items in the current data have word_type
      const hasWordType = data.some(item => item.word_type);
      
      if (hasWordType) {
        // Create a map of lesson number to word_type
        const lessonDescriptions = {};
        
        // Group word_type by lesson
        data.forEach(item => {
          const lessonNum = typeof item.lesson === 'string' ? 
            parseInt(item.lesson.replace('Lesson ', '')) : 
            item.lesson;
          
          if (!lessonDescriptions[lessonNum] && item.word_type) {
            lessonDescriptions[lessonNum] = item.word_type;
            console.log(`Lesson ${lessonNum}: ${item.word_type}`);
          }
        });
        
        // Update button labels
        lessonButtons.forEach(button => {
          const buttonId = button.id;
          if (buttonId && buttonId.startsWith('lesson-') && buttonId !== 'lesson-all') {
            const lessonNum = parseInt(buttonId.replace('lesson-', ''));
            if (lessonDescriptions[lessonNum]) {
              console.log(`Updating button ${buttonId} to: ${lessonDescriptions[lessonNum]}`);
              button.querySelector('.button-text').textContent = lessonDescriptions[lessonNum];
            }
          }
        });
      } else {
        // No word_type found, use default labels
        console.log('No word_type found in data, using default labels');
        this.resetToDefaultLabels(lessonButtons);
      }
    } else {
      // No data, use default labels
      this.resetToDefaultLabels(lessonButtons);
    }
  }
  
  resetToDefaultLabels(lessonButtons) {
    lessonButtons.forEach(button => {
      const buttonId = button.id;
      if (buttonId && buttonId.startsWith('lesson-') && buttonId !== 'lesson-all') {
        const lessonNum = buttonId.replace('lesson-', '');
        button.querySelector('.button-text').textContent = `Lesson ${lessonNum}`;
      }
    });
  }
}

export default new MenuSystem();