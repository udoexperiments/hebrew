// js/ui/ContentFormatter.js
import StateManager from '../managers/StateManager.js';

class ContentFormatter {
  formatHebrewContent(entry) {
    const templates = {
      sentences_present: () => `
        <div class="hebrew-text">
          <p class="spoken">${entry.hebrew_spoken}</p>
          <p class="letters">${entry.hebrew_letters}</p>
        </div>`,
      sentences_past: () => `
        <div class="hebrew-text">
          <p class="spoken">${entry.hebrew_spoken}</p>
          <p class="letters">${entry.hebrew_letters}</p>
        </div>`,
      sentences_future: () => `
        <div class="hebrew-text">
          <p class="spoken">${entry.hebrew_spoken}</p>
          <p class="letters">${entry.hebrew_letters}</p>
        </div>`,
      nouns: () => `
        <div class="hebrew-text">
          <div class="form-group">
            <span class="label">Singular:</span>
            <span class="spoken">${entry.hebrew_spoken_singular}</span>
            <span class="letters">(${entry.hebrew_letters_singular})</span>
          </div>
          <div class="form-group">
            <span class="label">Plural:</span>
            <span class="spoken">${entry.hebrew_spoken_plural}</span>
            <span class="letters">(${entry.hebrew_letters_plural})</span>
          </div>
        </div>`,
      verbs: () => `
        <div class="hebrew-text">
          <div class="form-group">
            <span class="label">General:</span>
            <span class="spoken">${entry.hebrew_spoken_general}</span>
            <span class="letters">(${entry.hebrew_letters_general})</span>
          </div>
          <div class="form-group">
            <span class="label">He:</span>
            <span class="spoken">${entry.hebrew_spoken_he}</span>
            <span class="letters">(${entry.hebrew_letters_he})</span>
          </div>
          <div class="form-group">
            <span class="label">She:</span>
            <span class="spoken">${entry.hebrew_spoken_she}</span>
            <span class="letters">(${entry.hebrew_letters_she})</span>
          </div>
        </div>`,
      adjectives: () => `
        <div class="hebrew-text">
          <div class="form-group">
            <span class="label">Male:</span>
            <span class="spoken">${entry.hebrew_spoken_male}</span>
            <span class="letters">(${entry.hebrew_letters_male})</span>
          </div>
          <div class="form-group">
            <span class="label">Female:</span>
            <span class="spoken">${entry.hebrew_spoken_female}</span>
            <span class="letters">(${entry.hebrew_letters_female})</span>
          </div>
        </div>`,
      grammar: () => {
        let html = '<div class="hebrew-text">';
        
        // Main content
        if (entry.hebrew_spoken || entry.hebrew_letters) {
          html += `
            <div class="form-group">
              <span class="label">Hebrew Spoken:</span>
              <span class="spoken">${entry.hebrew_spoken || ''}</span>
            </div>
            <div class="form-group">
              <span class="label">Hebrew Letters:</span>
              <span class="letters">(${entry.hebrew_letters || ''})</span>
            </div>`;
        }
        
        // Add examples if they exist - hidden by default
        if (entry.hebrew_spoken_example || entry.hebrew_letters_example) {
          html += `
            <div class="example-section" style="display: none;">
              <div class="form-group">
                <span class="label">Example Spoken:</span>
                <span class="spoken example">${entry.hebrew_spoken_example || ''}</span>
              </div>
              <div class="form-group">
                <span class="label">Example Letters:</span>
                <span class="letters example">(${entry.hebrew_letters_example || ''})</span>
              </div>
            </div>`;
        }
        
        html += '</div>';
        
        // Don't add the button here anymore - it's added in the UI update method
        return html;
      },
      basics: () => `
        <div class="hebrew-text">
          <div class="form-group">
            <span class="label">Hebrew Spoken:</span>
            <span class="spoken">${entry.hebrew_spoken}</span>
          </div>
          <div class="form-group">
            <span class="label">Hebrew Letters:</span>
            <span class="letters">(${entry.hebrew_letters})</span>
          </div>
        </div>`,
    };

    const currentCategory = StateManager.get('currentCategory');
    return templates[currentCategory]?.() || "";
  }
}

export default new ContentFormatter();