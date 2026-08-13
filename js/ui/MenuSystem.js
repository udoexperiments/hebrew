// js/ui/MenuSystem.js - Menu page: selects, lesson list, icons, page toggling
import StateManager from '../managers/StateManager.js';
import EventHandlers from '../handlers/EventHandlers.js';
import { CATEGORIES, SOUND_THEMES, COLOR_THEMES, CHUNK_OPTIONS } from '../config/constants.js';
import { ICONS, iconForLesson } from './icons.js';

class MenuSystem {
  init() {
    this.hydrateIcons();
    this.populateSelects();
    this.bindRows();
    this.refresh();
  }

  hydrateIcons() {
    document.querySelectorAll('[data-icon]').forEach((el) => {
      const icon = ICONS[el.dataset.icon];
      if (icon) el.innerHTML = icon;
    });
    document.querySelectorAll('.row-chevron').forEach((el) => (el.innerHTML = ICONS.chevronRight));
    document.querySelectorAll('.pill-chevron').forEach((el) => (el.innerHTML = ICONS.chevronDown));
    const set = (id, icon) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = icon;
    };
    set('menu-button', ICONS.menu);
    set('show-icon', ICONS.eye);
    set('swap-icon', ICONS.swap);
    set('chunk-peek', ICONS.table);
    set('overlay-close', ICONS.close);
  }

  // Unique lessons of a dataset: Map of number → label (topic or "Lesson n")
  lessonsOf(data) {
    const lessons = new Map();
    data.forEach((item) => {
      const num = typeof item.lesson === 'number'
        ? item.lesson
        : parseInt(String(item.lesson).replace('Lesson ', '').trim(), 10);
      if (!Number.isNaN(num) && !lessons.has(num)) {
        lessons.set(num, item.word_type || `Lesson ${num}`);
      }
    });
    return lessons;
  }

  fillSelect(select, options, currentValue) {
    if (!select) return;
    select.innerHTML = '';
    options.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.text = option.text;
      if (String(option.value) === String(currentValue)) optionElement.selected = true;
      select.appendChild(optionElement);
    });
  }

  populateSelects() {
    const bind = (id, options, stateKey, onChange) => {
      const select = document.getElementById(id);
      this.fillSelect(select, options, StateManager.get(stateKey));
      if (select) select.addEventListener('change', (e) => onChange(e.target.value));
    };

    bind('category-select', CATEGORIES, 'currentCategory', (v) => EventHandlers.setCategory(v));
    bind('category-select-menu', CATEGORIES, 'currentCategory', (v) => EventHandlers.setCategory(v));
    bind('chunk-select', CHUNK_OPTIONS, 'chunkSize', (v) => EventHandlers.setChunkSize(v));
    bind('chunk-select-menu', CHUNK_OPTIONS, 'chunkSize', (v) => EventHandlers.setChunkSize(v));
    bind('sound-select-menu', SOUND_THEMES, 'soundTheme', (v) => EventHandlers.setSoundTheme(v));
    bind('color-select-menu', COLOR_THEMES, 'colorTheme', (v) => EventHandlers.setColorTheme(v));

  }

  bindRows() {
    const on = (id, handler) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', handler);
    };
    on('language-row', () => EventHandlers.toggleDirection());
    on('about-row', () =>
      alert('Vocabulary Trainer\n\nA personal Hebrew learning app.\nWord data and audio are stored on your device — the app works fully offline.'));
    on('help-row', () =>
      alert('How to practice:\n\n1. Pick a category and lesson in the menu.\n2. Read the card, recall the translation.\n3. Tap Show (or the lower card) to reveal it.\n4. Mark yourself Correct or Mistake — mistakes return later in the round.\n\nA round covers your chosen chunk of words; the bar shows progress.'));
  }

  // Build lesson rows from the currently loaded data (only lessons that exist)
  buildLessonList() {
    const container = document.getElementById('lesson-list');
    if (!container) return;
    container.innerHTML = '';

    const lessons = this.lessonsOf(StateManager.get('data'));
    const allLessons = StateManager.get('allLessons');
    const currentLesson = StateManager.get('currentLesson');

    const addRow = (label, icon, isActive, onClick) => {
      const row = document.createElement('button');
      row.className = `lesson-row${isActive ? ' active' : ''}`;
      const iconSpan = document.createElement('span');
      iconSpan.className = 'row-icon';
      iconSpan.innerHTML = icon;
      const textSpan = document.createElement('span');
      textSpan.textContent = label;
      row.appendChild(iconSpan);
      row.appendChild(textSpan);
      row.addEventListener('click', onClick);
      container.appendChild(row);
    };

    addRow('All Lessons', ICONS.layers, allLessons, () => {
      EventHandlers.setLesson('all');
      this.toggle(); // picking a lesson means: start practicing
    });

    [...lessons.keys()].sort((a, b) => a - b).forEach((num) => {
      const label = lessons.get(num);
      addRow(label, iconForLesson(label), !allLessons && currentLesson === num, () => {
        EventHandlers.setLesson(num);
        this.toggle();
      });
    });
  }

  // Sync all displayed values (pills, menu rows, selects) with state
  refresh() {
    const category = StateManager.get('currentCategory');
    const categoryText = (CATEGORIES.find((c) => c.value === category) || {}).text || category;
    const chunkSize = StateManager.get('chunkSize');
    const soundTheme = StateManager.get('soundTheme');
    const soundText = (SOUND_THEMES.find((s) => s.value === soundTheme) || {}).text || soundTheme;
    const colorTheme = StateManager.get('colorTheme');
    const colorText = (COLOR_THEMES.find((c) => c.value === colorTheme) || {}).text || colorTheme;
    const direction = StateManager.get('isEnglishToHebrew') ? 'English → Hebrew' : 'Hebrew → English';

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    setText('category-pill-label', categoryText);
    setText('category-row-value', categoryText);
    setText('chunk-pill-label', `${chunkSize} words`);
    setText('chunk-row-value', `${chunkSize} words`);
    setText('sound-row-value', soundText);
    setText('color-row-value', colorText);
    setText('language-row-value', direction);
    setText('swap-label', direction);

    const setValue = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = String(value);
    };
    setValue('category-select', category);
    setValue('category-select-menu', category);
    setValue('chunk-select', chunkSize);
    setValue('chunk-select-menu', chunkSize);
    setValue('sound-select-menu', soundTheme);
    setValue('color-select-menu', colorTheme);

    this.buildLessonList();
  }

  toggle() {
    const isMenuOpen = !StateManager.get('isMenuOpen');
    StateManager.set('isMenuOpen', isMenuOpen);

    // Slide transition: menu enters from the left, practice exits right
    const slider = document.getElementById('page-slider');
    if (slider) slider.classList.toggle('menu-open', isMenuOpen);

    if (isMenuOpen) this.refresh();
  }
}

export default new MenuSystem();
