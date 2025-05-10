// js/services/DataService.js
import StateManager from '../managers/StateManager.js';

class DataService {
  async load(category) {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`resources/data/${category}.json?t=${timestamp}`);
      const data = await response.json();
      StateManager.set('data', data);
      return data;
    } catch (error) {
      console.error("Error loading data:", error);
      // Fallback data for testing
      const fallbackData = [
        { english: "Hello", hebrew_spoken: "Shalom", hebrew_letters: "שלום", lesson: 1 },
        { english: "Goodbye", hebrew_spoken: "Lehitraot", hebrew_letters: "להתראות", lesson: 1 },
        { english: "Thank you", hebrew_spoken: "Toda", hebrew_letters: "תודה", lesson: 1 },
      ];
      StateManager.set('data', fallbackData);
      return fallbackData;
    }
  }

  filterByLesson() {
    const data = StateManager.get('data');
    const allLessons = StateManager.get('allLessons');
    const currentLesson = StateManager.get('currentLesson');

    if (data.length === 0) return;

    if (allLessons) {
      StateManager.set('filteredData', data);
      console.log(`Using all lessons: ${data.length} items`);
      return;
    }

    // Filter data to only include items from the current lesson
    // Handle both numeric lesson values and "Lesson X" format
    const filteredData = data.filter((item) => {
      if (typeof item.lesson === 'number') {
        return item.lesson === currentLesson;
      } else if (typeof item.lesson === 'string') {
        // Extract number from "Lesson X" format or handle just number as string
        const lessonNum = item.lesson.replace('Lesson ', '').trim();
        return parseInt(lessonNum) === currentLesson;
      }
      return false;
    });

    if (filteredData.length === 0) {
      console.log(`No items found for Lesson ${currentLesson}. Using all data.`);
      StateManager.set('filteredData', data);
    } else {
      StateManager.set('filteredData', filteredData);
      console.log(`Filtered data for Lesson ${currentLesson}: ${filteredData.length} items`);
    }
  }
}

export default new DataService();