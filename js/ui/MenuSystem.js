// js/ui/MenuSystem.js - Modern menu implementation
import StateManager from '../managers/StateManager.js';
import DataService from '../services/DataService.js';
import ChunkManager from '../managers/ChunkManager.js';
import AudioService from '../services/AudioService.js';
import UI from './UI.js';
import { CATEGORIES, SOUND_THEMES, COLOR_THEMES } from '../config/constants.js';

class MenuSystem {
  constructor() {
    this.menuOpen = false;
  }

  create() {
    const menuGrid = document.getElementById("menu-grid");
    if (!menuGrid) {
      console.error("Menu grid element not found");
      return;
    }
    
    // Create modern menu structure
    const menuContent = document.createElement('div');
    menuContent.className = 'menu-content';
    
    // Menu header
    const menuHeader = document.createElement('div');
    menuHeader.className = 'menu-header';
    menuHeader.innerHTML = `
      <h2 class="menu-title">Settings</h2>
      <button class="action-button" id="close-menu">
        <span class="button-text">Close</span>
      </button>
    `;
    menuContent.appendChild(menuHeader);

    // Category Section
    const categorySection = this.createSection('Category');
    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'menu-control-container';
    categoryGrid.id = 'category-grid';
    
    CATEGORIES.forEach(category => {
      const card = this.createSettingsCard(
        category.text,
        this.getCategoryIcon(category.value),
        this.getCategoryColor(category.value),
        category.value === StateManager.get('currentCategory'),
        () => this.handleCategoryChange(category.value)
      );
      categoryGrid.appendChild(card);
    });
    
    categorySection.appendChild(categoryGrid);
    menuContent.appendChild(categorySection);

    // Study Settings Section
    const studySection = this.createSection('Study Settings');
    const studyGrid = document.createElement('div');
    studyGrid.className = 'menu-control-container';
    
    // Direction toggle
    const directionCard = this.createSettingsCard(
      'Direction',
      '🔄',
      'purple',
      true,
      () => this.toggleDirection()
    );
    directionCard.innerHTML += `<div class="settings-value" id="direction-value">${
      StateManager.get('isEnglishToHebrew') ? 'English → Hebrew' : 'Hebrew → English'
    }</div>`;
    studyGrid.appendChild(directionCard);
    
    // Chunk size
    const chunkCard = this.createSettingsCard(
      'Chunk Size',
      '📦',
      'blue',
      true,
      () => this.cycleChunkSize()
    );
    chunkCard.innerHTML += `<div class="settings-value" id="chunk-value">${
      StateManager.get('chunkSize')
    } words</div>`;
    studyGrid.appendChild(chunkCard);
    
    studySection.appendChild(studyGrid);
    menuContent.appendChild(studySection);

    // Lesson Section
    const lessonSection = this.createSection('Lessons');
    const lessonGrid = document.createElement('div');
    lessonGrid.className = 'lesson-buttons-container';
    lessonGrid.id = 'lesson-grid';
    
    this.createLessonButtons(lessonGrid);
    lessonSection.appendChild(lessonGrid);
    menuContent.appendChild(lessonSection);

    // Sound Section
    const soundSection = this.createSection('Sound Theme');
    const soundGrid = document.createElement('div');
    soundGrid.className = 'menu-control-container';
    
    SOUND_THEMES.forEach(theme => {
      const card = this.createSettingsCard(
        theme.text,
        '🔊',
        'teal',
        theme.value === StateManager.get('soundTheme'),
        () => this.handleSoundThemeChange(theme.value)
      );
      soundGrid.appendChild(card);
    });
    
    soundSection.appendChild(soundGrid);
    menuContent.appendChild(soundSection);

    // Color Theme Section
    const themeSection = this.createSection('Color Theme');
    const themeGrid = document.createElement('div');
    themeGrid.className = 'menu-control-container';
    
    COLOR_THEMES.forEach(theme => {
      const card = this.createSettingsCard(
        theme.text,
        '🎨',
        'pink',
        theme.value === StateManager.get('colorTheme'),
        () => this.handleColorThemeChange(theme.value)
      );
      themeGrid.appendChild(card);
    });
    
    themeSection.appendChild(themeGrid);
    menuContent.appendChild(themeSection);

    // Clear and add content
    menuGrid.innerHTML = '';
    menuGrid.appendChild(menuContent);
    
    // Add event listeners
    this.setupEventListeners();
  }

  createSection(title) {
    const section = document.createElement('div');
    section.className = 'menu-section';
    section.innerHTML = `<h3 class="menu-label">${title}</h3>`;
    return section;
  }

  createSettingsCard(label, icon, color, isActive, onClick) {
    const card = document.createElement('div');
    card.className = `settings-card ${isActive ? 'active' : ''}`;
    card.innerHTML = `
      <div class="settings-icon ${color}">${icon}</div>
      <div class="settings-label">${label}</div>
    `;
    card.addEventListener('click', onClick);
    return card;
  }

  createLessonButtons(container) {
    // All Lessons button
    const allButton = document.createElement('button');
    allButton.className = `menu-item full-width-button ${StateManager.get('allLessons') ? 'active-lesson' : ''}`;
    allButton.innerHTML = '<span class="button-text">All Lessons</span>';
    allButton.addEventListener('click', () => {
      StateManager.update({
        allLessons: true,
        currentLesson: 0
      });
      DataService.filterByLesson();
      ChunkManager.initializeRandomization();
      UI.update();
      this.updateLessonButtons();
    });
    container.appendChild(allButton);

    // Individual lesson buttons
    for (let i = 1; i <= 12; i++) {
      const button = document.createElement('button');
      button.className = `menu-item ${!StateManager.get('allLessons') && StateManager.get('currentLesson') === i ? 'active-lesson' : ''}`;
      button.innerHTML = `<span class="button-text">${this.getLessonLabel(i)}</span>`;
      button.addEventListener('click', () => {
        StateManager.update({
          allLessons: false,
          currentLesson: i
        });
        DataService.filterByLesson();
        ChunkManager.initializeRandomization();
        UI.update();
        this.updateLessonButtons();
      });
      container.appendChild(button);
    }
  }

  getLessonLabel(lessonNum) {
    const data = StateManager.get('data');
    if (data.length > 0) {
      const hasWordType = data.some(item => item.word_type);
      if (hasWordType) {
        const lessonDescriptions = {};
        data.forEach(item => {
          const itemLesson = typeof item.lesson === 'string' ? 
            parseInt(item.lesson.replace('Lesson ', '')) : 
            item.lesson;
          
          if (!lessonDescriptions[itemLesson] && item.word_type) {
            lessonDescriptions[itemLesson] = item.word_type;
          }
        });
        
        if (lessonDescriptions[lessonNum]) {
          return lessonDescriptions[lessonNum];
        }
      }
    }
    return `Lesson ${lessonNum}`;
  }

  getCategoryIcon(category) {
    const icons = {
      basics: '🔤',
      sentences_present: '💬',
      sentences_past: '⏮️',
      sentences_future: '⏭️',
      verbs: '🏃',
      nouns: '📦',
      adjectives: '🎨',
      grammar: '📐',
    };
    return icons[category] || '📚';
  }

  getCategoryColor(category) {
    const colors = {
      basics: 'purple',
      sentences_present: 'blue',
      sentences_past: 'teal',
      sentences_future: 'orange',
      verbs: 'pink',
      nouns: 'purple',
      adjectives: 'orange',
      grammar: 'teal',
    };
    return colors[category] || 'blue';
  }

  updateLessonButtons() {
    const buttons = document.querySelectorAll('.menu-item');
    const allLessons = StateManager.get('allLessons');
    const currentLesson = StateManager.get('currentLesson');
    
    buttons.forEach((button, index) => {
      if (index === 0) { // All Lessons button
        button.classList.toggle('active-lesson', allLessons);
      } else {
        button.classList.toggle('active-lesson', !allLessons && currentLesson === index);
      }
    });
    
    // Update lesson labels if needed
    this.updateLessonButtonLabels();
  }

  updateLessonButtonLabels() {
    const buttons = document.querySelectorAll('#lesson-grid .menu-item');
    buttons.forEach((button, index) => {
      if (index > 0) { // Skip "All Lessons" button
        const buttonText = button.querySelector('.button-text');
        if (buttonText) {
          buttonText.textContent = this.getLessonLabel(index);
        }
      }
    });
  }

  toggle() {
    const menuGrid = document.getElementById("menu-grid");
    if (!menuGrid) return;
    
    this.menuOpen = !this.menuOpen;
    
    if (this.menuOpen) {
      menuGrid.classList.add('visible');
      // Update lesson labels when opening menu
      this.updateLessonButtonLabels();
    } else {
      menuGrid.classList.remove('visible');
    }
    
    // Update menu button text
    const menuButton = document.getElementById("menu-button");
    if (menuButton) {
      menuButton.querySelector(".button-text").innerText = this.menuOpen ? "Close" : "☰ Menu";
    }
  }

  setupEventListeners() {
    // Close button
    const closeButton = document.getElementById('close-menu');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.toggle());
    }
    
    // Click outside to close
    const menuGrid = document.getElementById('menu-grid');
    if (menuGrid) {
      menuGrid.addEventListener('click', (e) => {
        if (e.target === menuGrid) {
          this.toggle();
        }
      });
    }
  }

  async handleCategoryChange(value) {
    StateManager.set('currentCategory', value);
    await DataService.load(value);
    DataService.filterByLesson();
    ChunkManager.initializeRandomization();
    UI.update();
    UI.updateProgress();
    
    // Update active states
    this.updateActiveStates();
    this.updateLessonButtonLabels();
  }

  handleSoundThemeChange(value) {
    StateManager.set('soundTheme', value);
    AudioService.initialize();
    this.updateActiveStates();
  }

  handleColorThemeChange(value) {
    StateManager.set('colorTheme', value);
    UI.updateColorTheme(value);
    this.updateActiveStates();
  }

  toggleDirection() {
    const isEnglishToHebrew = !StateManager.get('isEnglishToHebrew');
    StateManager.set('isEnglishToHebrew', isEnglishToHebrew);
    
    // Update direction display
    const directionValue = document.getElementById('direction-value');
    if (directionValue) {
      directionValue.textContent = isEnglishToHebrew ? 'English → Hebrew' : 'Hebrew → English';
    }
    
    UI.update();
  }

  cycleChunkSize() {
    const currentSize = StateManager.get('chunkSize');
    const sizes = [10, 20, 30, 40, 50];
    const currentIndex = sizes.indexOf(currentSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    
    StateManager.set('chunkSize', nextSize);
    DataService.filterByLesson();
    ChunkManager.initializeRandomization();
    UI.update();
    UI.updateProgress();
    
    // Update chunk size display
    const chunkValue = document.getElementById('chunk-value');
    if (chunkValue) {
      chunkValue.textContent = `${nextSize} words`;
    }
  }

  updateActiveStates() {
    // Update category cards
    const categoryCards = document.querySelectorAll('#category-grid .settings-card');
    const currentCategory = StateManager.get('currentCategory');
    categoryCards.forEach((card, index) => {
      card.classList.toggle('active', CATEGORIES[index].value === currentCategory);
    });
    
    // Update sound theme cards
    const soundCards = document.querySelectorAll('.menu-section:nth-of-type(4) .settings-card');
    const currentSound = StateManager.get('soundTheme');
    soundCards.forEach((card, index) => {
      card.classList.toggle('active', SOUND_THEMES[index].value === currentSound);
    });
    
    // Update color theme cards
    const themeCards = document.querySelectorAll('.menu-section:nth-of-type(5) .settings-card');
    const currentTheme = StateManager.get('colorTheme');
    themeCards.forEach((card, index) => {
      card.classList.toggle('active', COLOR_THEMES[index].value === currentTheme);
    });
  }
}

export default new MenuSystem();